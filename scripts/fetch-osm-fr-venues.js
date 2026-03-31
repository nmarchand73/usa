/**
 * Fetch FR MTB bike parks, pumptracks et pistes BMX from OpenStreetMap (Overpass).
 *
 * Output: map-data/venues-map-fr.json — clés :
 *   mtbBikeParks, pumptracks (cycling=pump_track), bmxTracks (sport=bmx + leisure track/pitch).
 *   Campings Yelloh! Village : npm run fetch:fr-yelloh-official → yellohvillage-official-fr.json (fusion build:fr).
 *
 * Bike parks « descente montagne » (OSM) : voir wiki
 *   https://wiki.openstreetmap.org/wiki/Tag:mtb:type%3Ddownhill
 *   et https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dbike_park
 * On exporte mtbProfile=downhill si mtb:type ∈ downhill|freeride|bikepark ou mtb:lift=yes.
 *
 * Sources non-OSM (annuaires, FFC, médias) pour veille ou saisie manuelle :
 *   public/bikeparks-fr-external-sources.json
 *
 * Notes:
 * - This is a best-effort extraction; OSM tagging varies by place.
 * - We restrict to area "France" and filter to items with coordinates.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const OUT_FILE = path.join(BASE, 'map-data', 'venues-map-fr.json');

/** Kumi en tête : souvent moins saturé que overpass-api.de. */
const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter'
];

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(body, 'utf8');
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'Content-Length': data.length
        }
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(raw);
          } else {
            reject(new Error(`Overpass HTTP ${res.statusCode}: ${raw.slice(0, 500)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function toFeature(el) {
  // el can be node (lat/lon), way/relation (center.lat/center.lon when using out center)
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  const tags = el.tags || {};
  const name = tags.name || tags['name:fr'] || tags['name:en'] || null;
  const osmType = el.type;
  const osmId = el.id;
  const osmUrl = osmType && osmId ? `https://www.openstreetmap.org/${osmType}/${osmId}` : null;
  return { lat, lng, name, tags, osmUrl };
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== '') return v;
  }
  return null;
}

/** Profil affichage : downhill = bike park / zone VTT montagne (descente, freeride, lift). */
function mtbProfileFromTags(t) {
  if (!t) return 'general';
  const mt = String(t['mtb:type'] || t.mtb_type || '').toLowerCase().trim();
  if (mt === 'downhill' || mt === 'freeride' || mt === 'bikepark') return 'downhill';
  if (t['mtb:lift'] === 'yes' || t.mtb_lift === 'yes') return 'downhill';
  return 'general';
}

function normalizeMtbBikeParks(elements) {
  const out = [];
  for (const el of elements) {
    const f = toFeature(el);
    if (!f) continue;
    const t = f.tags;
    const mtbType = t['mtb:type'] || t.mtb_type || null;
    const mtbLift = t['mtb:lift'] || t.mtb_lift || null;
    const item = {
      name: f.name || pick(t, ['brand', 'operator']) || 'Bike park',
      city: pick(t, [
        'addr:city',
        'addr:municipality',
        'addr:place',
        'addr:suburb',
        'is_in:city',
        'is_in:municipality',
        'is_in:town',
        'is_in:village',
        'is_in'
      ]),
      lat: f.lat,
      lng: f.lng,
      url: pick(t, ['website', 'contact:website']) || f.osmUrl,
      source: 'OSM/Overpass',
      osmUrl: f.osmUrl,
      mtbType: mtbType || null,
      mtbLift: mtbLift || null,
      mtbProfile: mtbProfileFromTags(t)
    };
    out.push(item);
  }
  return out;
}

function normalizePumptracks(elements) {
  const out = [];
  for (const el of elements) {
    const f = toFeature(el);
    if (!f) continue;
    const t = f.tags;
    const item = {
      name: f.name || 'Pumptrack',
      city: pick(t, [
        'addr:city',
        'addr:municipality',
        'addr:place',
        'addr:suburb',
        'is_in:city',
        'is_in:municipality',
        'is_in:town',
        'is_in:village',
        'is_in'
      ]),
      lat: f.lat,
      lng: f.lng,
      type: 'pumptrack',
      venueKind: 'pumptrack',
      url: pick(t, ['website', 'contact:website']) || f.osmUrl,
      source: 'OSM/Overpass',
      osmUrl: f.osmUrl
    };
    out.push(item);
  }
  return out;
}

function normalizeBmxTracks(elements) {
  const out = [];
  for (const el of elements) {
    const f = toFeature(el);
    if (!f) continue;
    const t = f.tags;
    const item = {
      name: f.name || 'Piste BMX',
      city: pick(t, [
        'addr:city',
        'addr:municipality',
        'addr:place',
        'addr:suburb',
        'is_in:city',
        'is_in:municipality',
        'is_in:town',
        'is_in:village',
        'is_in'
      ]),
      lat: f.lat,
      lng: f.lng,
      type: 'bmx_track',
      venueKind: 'bmx_track',
      url: pick(t, ['website', 'contact:website']) || f.osmUrl,
      source: 'OSM/Overpass',
      osmUrl: f.osmUrl
    };
    out.push(item);
  }
  return out;
}

async function runQuery(overpassUrl, query) {
  const raw = await httpPost(overpassUrl, 'data=' + encodeURIComponent(query));
  return JSON.parse(raw);
}

async function main() {
  // Overpass QL:
  // - MTB : leisure=bike_park, sport=cycling+mtb, et points sport=cycling+mtb:type=downhill (sentiers / accès);
  // - Pumptracks / BMX : inchangé.
  // Réf. wiki : Tag:mtb:type=downhill, leisure=bike_park.
  const q = `
[out:json][timeout:120];
area["ISO3166-1"="FR"][admin_level=2]->.fr;

(
  nwr["leisure"="bike_park"](area.fr);
  nwr["sport"="cycling"]["mtb"~"."](area.fr);
  node["sport"="cycling"]["mtb:type"="downhill"](area.fr);
)->.mtb;

(
  nwr["cycling"="pump_track"](area.fr);
  nwr["leisure"="track"]["sport"="bmx"](area.fr);
  nwr["sport"="bmx"]["leisure"="pitch"](area.fr);
)->.pump;

(.mtb; .pump;);
out center tags;
  `.trim();

  const qYelloh = `
[out:json][timeout:90];
area["ISO3166-1"="FR"][admin_level=2]->.fr;
(
  nwr["tourism"="camp_site"]["operator"~"Yelloh",i](area.fr);
  nwr["tourism"="camp_site"]["brand"~"Yelloh",i](area.fr);
  nwr["tourism"="camp_site"]["network"~"Yelloh",i](area.fr);
);
out center tags;
  `.trim();

  let json = null;
  let lastErr = null;
  for (const url of OVERPASS_URLS) {
    try {
      json = await runQuery(url, q);
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
      console.warn('Overpass failed:', url, e.message);
    }
  }
  if (!json) throw lastErr || new Error('All Overpass endpoints failed');
  const els = Array.isArray(json.elements) ? json.elements : [];

  const mtbEls = els.filter(
    (e) =>
      e.tags &&
      (e.tags.leisure === 'bike_park' ||
        (e.tags.sport === 'cycling' && e.tags.mtb) ||
        (e.tags.sport === 'cycling' && e.tags['mtb:type'] === 'downhill'))
  );
  /** Pumptracks : boucles bitumées / modules — tag standard OSM cycling=pump_track */
  const pumpTrackEls = els.filter((e) => e.tags && e.tags.cycling === 'pump_track');
  /** Pistes BMX : stade / piste — pas les pumptracks */
  const bmxTrackEls = els.filter((e) => {
    const t = e.tags;
    if (!t || t.sport !== 'bmx' || t.cycling === 'pump_track') return false;
    return t.leisure === 'track' || t.leisure === 'pitch';
  });

  const mtb = normalizeMtbBikeParks(mtbEls);
  const pumptracks = normalizePumptracks(pumpTrackEls);
  const bmxTracks = normalizeBmxTracks(bmxTrackEls);

  function dedupe(items) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const k = it.osmUrl || `${it.lat},${it.lng},${it.name}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(it);
    }
    return out;
  }

  const outJson = {
    mtbBikeParks: dedupe(mtb).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    pumptracks: dedupe(pumptracks).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    bmxTracks: dedupe(bmxTracks).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(outJson, null, 2), 'utf-8');
  const mtbDh = outJson.mtbBikeParks.filter((x) => x.mtbProfile === 'downhill').length;
  console.log('Written:', OUT_FILE);
  console.log('mtbBikeParks:', outJson.mtbBikeParks.length, '(profil descente/montagne:', mtbDh + ')');
  console.log('pumptracks:', outJson.pumptracks.length);
  console.log('bmxTracks (pistes BMX):', outJson.bmxTracks.length);
  console.log('Yelloh! Village : lancer npm run fetch:fr-yelloh-official puis npm run build:fr');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

