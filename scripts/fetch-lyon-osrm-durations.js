/**
 * Fetch driving durations via OSRM public server for Lyon items.
 *
 * Input:  map-data/lyon-zones.json (items[].lat/lng required)
 * Output: updates items[].durations.carOsrm = { minutes, distanceKm, fetchedAt, source, url }
 *
 * Notes:
 * - Uses OSRM demo server: https://router.project-osrm.org/
 * - Be polite: delay between requests (OSRM_DELAY_MS, default 500ms)
 *
 * Env:
 *   OSRM_DELAY_MS=500
 *   OSRM_LIMIT=10
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const IN_FILE = path.join(BASE, 'map-data', 'lyon-zones.json');

const OSRM_BASE = 'https://router.project-osrm.org';
const USER_AGENT = 'usa-interactive-map/2.0 (Lyon OSRM durations; local dev)';
const DELAY_MS = Math.max(250, Number(process.env.OSRM_DELAY_MS) || 500);
const LIMIT = Math.max(0, parseInt(process.env.OSRM_LIMIT || '0', 10) || 0);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(new Error(`JSON parse: ${e.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
  });
}

function osrmRouteUrl(origin, dest) {
  // OSRM expects lon,lat
  const coords = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
  const u = new URL(OSRM_BASE + '/route/v1/driving/' + coords);
  u.searchParams.set('overview', 'false');
  u.searchParams.set('alternatives', 'false');
  u.searchParams.set('steps', 'false');
  return u.toString();
}

async function fetchOne(origin, item) {
  const url = osrmRouteUrl(origin, item);
  const j = await httpsGetJson(url);
  if (!j || j.code !== 'Ok' || !Array.isArray(j.routes) || !j.routes.length) {
    throw new Error(`OSRM bad response: ${j && j.code}`);
  }
  const r = j.routes[0];
  const durSec = Number(r.duration);
  const distM = Number(r.distance);
  if (!Number.isFinite(durSec) || !Number.isFinite(distM)) throw new Error('OSRM missing duration/distance');
  return {
    minutes: Math.max(1, Math.round(durSec / 60)),
    distanceKm: Math.round((distM / 1000) * 10) / 10,
    fetchedAt: new Date().toISOString(),
    source: 'OSRM',
    url
  };
}

async function main() {
  const raw = fs.readFileSync(IN_FILE, 'utf8');
  const data = JSON.parse(raw);
  const items = Array.isArray(data.items) ? data.items : [];
  const origin = data.origin || {
    label: '200 Quai Charles de Gaulle, 69006 Lyon',
    lat: 45.7821579,
    lng: 4.8481081
  };
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) throw new Error('origin.lat/lng missing');

  let done = 0;
  let miss = 0;
  for (const item of items) {
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) {
      item.durations = item.durations || {};
      item.durations.carOsrm = { status: 'miss', fetchedAt: new Date().toISOString(), source: 'OSRM' };
      miss++;
      continue;
    }
    item.durations = item.durations || {};
    if (item.durations.carOsrm && item.durations.carOsrm.minutes != null) continue;

    if (LIMIT > 0 && done >= LIMIT) break;
    await sleep(DELAY_MS);
    try {
      const out = await fetchOne(origin, item);
      item.durations.carOsrm = Object.assign({ status: 'ok' }, out);
      done++;
      console.log('OK', item.id, out.minutes + ' min', out.distanceKm + ' km');
    } catch (e) {
      item.durations.carOsrm = { status: 'miss', fetchedAt: new Date().toISOString(), source: 'OSRM', error: e.message };
      miss++;
      console.warn('MISS', item.id, e.message);
    }
  }

  fs.writeFileSync(IN_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('---');
  console.log('Updated:', done, 'miss:', miss);
  console.log('→', IN_FILE);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

