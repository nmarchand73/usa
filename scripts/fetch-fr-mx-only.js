/**
 * Requête Overpass légère : uniquement sport=motocross en France.
 * Sortie : map-data/mx-fr-overpass.json → fusionné par merge-json-fr.js dans app-data-fr.json
 *
 * Usage : node scripts/fetch-fr-mx-only.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const OUT_FILE = path.join(BASE, 'map-data', 'mx-fr-overpass.json');

const OVERPASS_URLS = [
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from('data=' + encodeURIComponent(body), 'utf8');
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
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
          else reject(new Error(`Overpass HTTP ${res.statusCode}: ${raw.slice(0, 400)}`));
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function pick(obj, keys) {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && v !== '') return String(v);
  }
  return null;
}

function normalize(elements) {
  const out = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;
    const t = el.tags || {};
    if (t.sport !== 'motocross' || t.cycling === 'pump_track') continue;
    const osmType = el.type;
    const osmId = el.id;
    const osmUrl = osmType && osmId ? `https://www.openstreetmap.org/${osmType}/${osmId}` : null;
    const name = t.name || t['name:fr'] || pick(t, ['operator', 'club']) || 'Terrain motocross';
    out.push({
      name,
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
      lat,
      lng,
      type: 'mx_track',
      venueKind: 'mx_track',
      url: pick(t, ['website', 'contact:website']) || osmUrl,
      source: 'OSM/Overpass',
      osmUrl,
      operator: pick(t, ['operator', 'club'])
    });
  }
  return out;
}

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

const QUERY = `
[out:json][timeout:600];
area["ISO3166-1"="FR"]["admin_level"="2"]->.fr;
nwr["sport"="motocross"](area.fr);
out center tags;
`.trim();

async function main() {
  let raw = null;
  let lastErr = null;
  for (const url of OVERPASS_URLS) {
    try {
      raw = await httpPost(url, QUERY);
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
      console.warn('Overpass failed:', url, e.message);
    }
  }
  if (!raw) throw lastErr || new Error('All Overpass endpoints failed');
  const json = JSON.parse(raw);
  const els = Array.isArray(json.elements) ? json.elements : [];
  const mxTracks = dedupe(normalize(els)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const payload = {
    generatedAt: new Date().toISOString(),
    mxTracks
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  console.log('Written:', OUT_FILE);
  console.log('mxTracks:', mxTracks.length);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
