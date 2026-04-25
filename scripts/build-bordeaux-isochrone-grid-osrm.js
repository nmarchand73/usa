/**
 * Build an OSRM driving-duration grid around Bordeaux origin for isochrone rendering.
 *
 * Output:
 * - map-data/bordeaux-iso-grid-osrm.json (source)
 * - public/bordeaux-iso-grid.json (served)
 *
 * Approach:
 * - Generate a regular lat/lng grid around the origin (bbox).
 * - Use OSRM Table API with batches (origin as source, grid points as destinations).
 *
 * Env:
 *   OSRM_DELAY_MS=350
 *   ISO_NX=90
 *   ISO_NY=90
 *   ISO_RADIUS_KM=30
 *   OSRM_BASE=https://router.project-osrm.org
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_DIR = path.join(__dirname, '..');
const IN_ZONES = path.join(BASE_DIR, 'map-data', 'bordeaux-zones.json');
const OUT_MAPDATA = path.join(BASE_DIR, 'map-data', 'bordeaux-iso-grid-osrm.json');
const OUT_PUBLIC = path.join(BASE_DIR, 'public', 'bordeaux-iso-grid.json');

const OSRM_BASE = process.env.OSRM_BASE || 'https://router.project-osrm.org';
const USER_AGENT = 'usa-interactive-map/2.0 (Bordeaux OSRM isochrone grid; local dev)';

const DELAY_MS = Math.max(200, Number(process.env.OSRM_DELAY_MS) || 350);
const NX = Math.max(40, parseInt(process.env.ISO_NX || '90', 10) || 90);
const NY = Math.max(40, parseInt(process.env.ISO_NY || '90', 10) || 90);
const RADIUS_KM = Math.max(10, Number(process.env.ISO_RADIUS_KM) || 30);

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

function kmToDegLat(km) {
  return km / 110.574;
}

function kmToDegLng(km, lat) {
  const rad = (lat * Math.PI) / 180;
  const kmPerDeg = 111.320 * Math.cos(rad);
  return kmPerDeg > 1e-6 ? km / kmPerDeg : km / 111.320;
}

function buildBbox(origin, radiusKm) {
  const dLat = kmToDegLat(radiusKm);
  const dLng = kmToDegLng(radiusKm, origin.lat);
  return {
    minLat: origin.lat - dLat,
    maxLat: origin.lat + dLat,
    minLng: origin.lng - dLng,
    maxLng: origin.lng + dLng
  };
}

function gridPoints(bbox, nx, ny) {
  const pts = [];
  for (let y = 0; y < ny; y++) {
    const tY = ny === 1 ? 0 : y / (ny - 1);
    const lat = bbox.maxLat - tY * (bbox.maxLat - bbox.minLat);
    for (let x = 0; x < nx; x++) {
      const tX = nx === 1 ? 0 : x / (nx - 1);
      const lng = bbox.minLng + tX * (bbox.maxLng - bbox.minLng);
      pts.push({ x, y, lat, lng });
    }
  }
  return pts;
}

function osrmTableUrl(origin, dests) {
  const coords = [`${origin.lng},${origin.lat}`, ...dests.map((d) => `${d.lng},${d.lat}`)].join(';');
  const u = new URL(OSRM_BASE + '/table/v1/driving/' + coords);
  u.searchParams.set('sources', '0');
  const idx = [];
  for (let i = 0; i < dests.length; i++) idx.push(String(i + 1));
  u.searchParams.set('destinations', idx.join(';'));
  u.searchParams.set('annotations', 'duration,distance');
  return u.toString();
}

async function main() {
  const zones = JSON.parse(fs.readFileSync(IN_ZONES, 'utf8'));
  const origin = zones.origin;
  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    throw new Error('Missing zones.origin lat/lng in map-data/bordeaux-zones.json');
  }

  const bbox = buildBbox(origin, RADIUS_KM);
  const pts = gridPoints(bbox, NX, NY);

  const minutes = new Array(NX * NY).fill(null);
  const distanceKm = new Array(NX * NY).fill(null);

  const BATCH = 90; // + origin => 91 coords
  let ok = 0;
  let miss = 0;

  for (let i = 0; i < pts.length; i += BATCH) {
    const batch = pts.slice(i, i + BATCH);
    await sleep(DELAY_MS);
    const url = osrmTableUrl(origin, batch);
    const j = await httpsGetJson(url);

    const durs = j && Array.isArray(j.durations) && Array.isArray(j.durations[0]) ? j.durations[0] : null;
    const dists = j && Array.isArray(j.distances) && Array.isArray(j.distances[0]) ? j.distances[0] : null;
    if (!durs || durs.length !== batch.length) throw new Error('OSRM table durations shape mismatch');

    for (let k = 0; k < batch.length; k++) {
      const p = batch[k];
      const idx = p.y * NX + p.x;
      const sec = Number(durs[k]);
      if (!Number.isFinite(sec) || sec <= 0) {
        minutes[idx] = null;
        distanceKm[idx] = null;
        miss++;
        continue;
      }
      minutes[idx] = Math.max(1, Math.round(sec / 60));
      const dm = dists && dists[k] != null ? Number(dists[k]) : NaN;
      distanceKm[idx] = Number.isFinite(dm) ? Math.round((dm / 1000) * 10) / 10 : null;
      ok++;
    }

    const prog = Math.min(pts.length, i + BATCH);
    if (prog % (BATCH * 5) === 0 || prog === pts.length) {
      console.log('progress', prog + '/' + pts.length);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    source: 'OSRM table',
    osrmBase: OSRM_BASE,
    origin,
    bbox,
    grid: { nx: NX, ny: NY },
    minutes,
    distanceKm,
    summary: { ok, miss }
  };

  fs.writeFileSync(OUT_MAPDATA, JSON.stringify(out, null, 2) + '\n', 'utf8');
  fs.writeFileSync(OUT_PUBLIC, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('Written:', OUT_MAPDATA);
  console.log('Written:', OUT_PUBLIC);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

