/**
 * Split legacy combined `bmxTracks` into `pumptracks` vs `bmxTracks` using OSM tags
 * (same Overpass union as fetch-osm-fr-venues.js), preserving city & meta on each row.
 *
 * Run once after updating fetch logic, or to fix an existing venues-map-fr.json.
 *
 * Usage: node scripts/reclassify-fr-pump-bmx.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const VENUES_FILE = path.join(BASE, 'map-data', 'venues-map-fr.json');

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
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
          else reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 400)}`));
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function osmKeyFromUrl(url) {
  if (!url) return null;
  const m = String(url).match(/openstreetmap\.org\/(node|way|relation)\/(\d+)/i);
  return m ? `${m[1].toLowerCase()}/${m[2]}` : null;
}

function classifyElement(e) {
  const t = e.tags || {};
  if (t.cycling === 'pump_track') return 'pumptrack';
  if (t.sport === 'bmx' && t.cycling !== 'pump_track') {
    if (t.leisure === 'track' || t.leisure === 'pitch') return 'bmx_track';
  }
  return null;
}

function guessFromName(name) {
  const n = String(name || '').toLowerCase();
  if (/pump[\s\-]?track|pumptrack|piste\s*pump/i.test(n)) return 'pumptrack';
  if (/\bpump\b/i.test(n) && !/bmx\s*(race|compétition|competition)/i.test(n)) return 'pumptrack';
  if (/bicross|supercross|piste\s*(de\s*)?bmx|terrain\s*bmx|stade.*bmx|bmx\s*(la|de|du|d']|track|race)/i.test(n)) {
    return 'bmx_track';
  }
  return 'pumptrack';
}

async function main() {
  const raw = fs.readFileSync(VENUES_FILE, 'utf8');
  const venues = JSON.parse(raw);
  const existingPump = Array.isArray(venues.pumptracks) ? venues.pumptracks : [];
  const existingBmx = Array.isArray(venues.bmxTracks) ? venues.bmxTracks : [];

  const q = `
[out:json][timeout:120];
area["ISO3166-1"="FR"][admin_level=2]->.fr;
(
  nwr["cycling"="pump_track"](area.fr);
  nwr["leisure"="track"]["sport"="bmx"](area.fr);
  nwr["sport"="bmx"]["leisure"="pitch"](area.fr);
);
out center tags;
`.trim();

  let json = null;
  for (const url of OVERPASS_URLS) {
    try {
      json = JSON.parse(await httpPost(url, 'data=' + encodeURIComponent(q)));
      break;
    } catch (e) {
      console.warn('Overpass:', url, e.message);
    }
  }
  if (!json || !Array.isArray(json.elements)) {
    throw new Error('Overpass failed — impossible de classifier sans réseau.');
  }

  const kindByKey = new Map();
  for (const el of json.elements) {
    const kind = classifyElement(el);
    if (!kind || !el.type || el.id == null) continue;
    kindByKey.set(`${el.type}/${el.id}`, kind);
  }

  const combined = [...existingPump, ...existingBmx];
  const pumptracks = [];
  const bmxTracks = [];
  let fromOsm = 0;
  let fromName = 0;

  for (const v of combined) {
    const key = osmKeyFromUrl(v.osmUrl || v.url);
    let kind = key ? kindByKey.get(key) : null;
    if (kind) fromOsm++;
    else {
      kind = guessFromName(v.name);
      fromName++;
    }

    const copy = { ...v };
    if (kind === 'pumptrack') {
      copy.venueKind = 'pumptrack';
      copy.type = 'pumptrack';
      pumptracks.push(copy);
    } else {
      copy.venueKind = 'bmx_track';
      copy.type = 'bmx_track';
      bmxTracks.push(copy);
    }
  }

  function dedupe(items, keyFn) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const k = keyFn(it);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(it);
    }
    return out;
  }

  venues.pumptracks = dedupe(
    pumptracks,
    (it) => it.osmUrl || `${it.lat},${it.lng}`
  ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  venues.bmxTracks = dedupe(
    bmxTracks,
    (it) => it.osmUrl || `${it.lat},${it.lng}`
  ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (venues._venuesMeta) {
    venues._venuesMeta.reclassifiedPumpBmxAt = new Date().toISOString().slice(0, 10);
    venues._venuesMeta.reclassifyStats = { fromOsmTag: fromOsm, fromNameHeuristic: fromName };
  }

  fs.writeFileSync(VENUES_FILE, JSON.stringify(venues, null, 2), 'utf8');
  console.log('Written', VENUES_FILE);
  console.log('pumptracks:', venues.pumptracks.length, 'bmxTracks:', venues.bmxTracks.length);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
