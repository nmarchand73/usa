/**
 * Fetch FR MTB bike parks and BMX pumptracks from OpenStreetMap (Overpass).
 *
 * Output: map-data/venues-map-fr.json
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

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
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

function normalizeMtbBikeParks(elements) {
  const out = [];
  for (const el of elements) {
    const f = toFeature(el);
    if (!f) continue;
    const t = f.tags;
    const item = {
      name: f.name || pick(t, ['brand', 'operator']) || 'Bike park',
      city: pick(t, ['addr:city', 'is_in:city', 'is_in']),
      lat: f.lat,
      lng: f.lng,
      url: pick(t, ['website', 'contact:website']) || f.osmUrl,
      source: 'OSM/Overpass',
      osmUrl: f.osmUrl
    };
    out.push(item);
  }
  return out;
}

function normalizeBmxPumptracks(elements) {
  const out = [];
  for (const el of elements) {
    const f = toFeature(el);
    if (!f) continue;
    const t = f.tags;
    const item = {
      name: f.name || 'Pumptrack',
      city: pick(t, ['addr:city', 'is_in:city', 'is_in']),
      lat: f.lat,
      lng: f.lng,
      type: 'pumptrack',
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
  // - Get area for France
  // - Query MTB bike parks via leisure=bike_park and sport=cycling + name, etc.
  // - Query pumptracks via cycling=pump_track OR leisure=track + sport=bmx OR sport=cycling + pumptrack tag
  //
  // We keep queries permissive and dedupe by osmUrl.
  const q = `
[out:json][timeout:120];
area["ISO3166-1"="FR"][admin_level=2]->.fr;

(
  nwr["leisure"="bike_park"](area.fr);
  nwr["sport"="cycling"]["mtb"~"."](area.fr);
)->.mtb;

(
  nwr["cycling"="pump_track"](area.fr);
  nwr["leisure"="track"]["sport"="bmx"](area.fr);
  nwr["sport"="bmx"]["leisure"="pitch"](area.fr);
)->.pump;

(.mtb; .pump;);
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

  // Split by tags
  const mtbEls = els.filter((e) => e.tags && (e.tags.leisure === 'bike_park' || (e.tags.sport === 'cycling' && e.tags.mtb)));
  const pumpEls = els.filter((e) => e.tags && (e.tags.cycling === 'pump_track' || (e.tags.leisure === 'track' && e.tags.sport === 'bmx') || e.tags.sport === 'bmx'));

  const mtb = normalizeMtbBikeParks(mtbEls);
  const pump = normalizeBmxPumptracks(pumpEls);

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
    bmxTracks: dedupe(pump).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(outJson, null, 2), 'utf-8');
  console.log('Written:', OUT_FILE);
  console.log('mtbBikeParks:', outJson.mtbBikeParks.length);
  console.log('bmxTracks(pumptracks):', outJson.bmxTracks.length);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

