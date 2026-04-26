/**
 * Geocode map-data/bordeaux-zones.json via Nominatim (search).
 *
 * Policy: ≥1 request/s, identifiable User-Agent
 * (https://operations.osmfoundation.org/policies/nominatim/).
 *
 * Env:
 *   NOMINATIM_UA — custom User-Agent
 *   NOMINATIM_EMAIL — optional contact (recommended)
 *   NOMINATIM_DELAY_MS — min delay between requests (default 1100)
 *   BORDEAUX_GEOCODE_DRY_RUN=1 — no write
 *   BORDEAUX_GEOCODE_LIMIT=n — max items to process
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const DATA_FILE = path.join(BASE, 'map-data', 'bordeaux-zones.json');

const USER_AGENT =
  process.env.NOMINATIM_UA ||
  'usa-interactive-map/2.0 (Bordeaux zones geocode; local dev)';
const DELAY_MS = Math.max(1000, Number(process.env.NOMINATIM_DELAY_MS) || 1100);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
          'Accept-Language': 'fr'
        }
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (raw += chunk));
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

async function searchNominatim(q) {
  const u = new URL('https://nominatim.openstreetmap.org/search');
  u.searchParams.set('q', q);
  u.searchParams.set('format', 'json');
  u.searchParams.set('limit', '1');
  u.searchParams.set('countrycodes', 'fr');
  u.searchParams.set('addressdetails', '1');
  if (process.env.NOMINATIM_EMAIL) u.searchParams.set('email', process.env.NOMINATIM_EMAIL);
  const arr = await httpsGetJson(u.toString());
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

function communeFallbackQuery(name) {
  return `${name}, Gironde, France`;
}

function defaultQuartierQuery(name) {
  // Some quartiers are ambiguous; prefer explicit Bordeaux.
  return `${name}, Bordeaux, France`;
}

async function geocodeOrigin(origin) {
  // Requête explicite (éviter "Hôtel de Ville" → homonyme hors Bordeaux).
  const q =
    (origin && origin.geocodeQuery) ? String(origin.geocodeQuery)
    : 'Place de la Bourse, Bordeaux, France';
  await sleep(DELAY_MS);
  const hit = await searchNominatim(q);
  return { hit, usedQuery: q };
}

async function geocodeOneItem(item) {
  if (item.kind === 'commune') {
    const q1 = item.geocodeQuery || `${item.name}, Gironde, France`;
    await sleep(DELAY_MS);
    let hit = await searchNominatim(q1);
    let usedQuery = q1;
    if (!hit) {
      const q2 = communeFallbackQuery(item.name);
      usedQuery = q2;
      await sleep(DELAY_MS);
      hit = await searchNominatim(q2);
    }
    return { hit, usedQuery };
  }

  if (item.kind === 'quartier') {
    const q1 = item.geocodeQuery || defaultQuartierQuery(item.name);
    await sleep(DELAY_MS);
    const hit = await searchNominatim(q1);
    return { hit, usedQuery: q1 };
  }

  return { hit: null, usedQuery: item.id };
}

function needsGeocode(item) {
  return !Number.isFinite(item.lat) || !Number.isFinite(item.lng);
}

function applyHit(target, hit, usedQuery) {
  if (!hit) {
    target.geocode = {
      status: 'miss',
      query: usedQuery,
      displayName: null,
      placeId: null
    };
    target.lat = null;
    target.lng = null;
    return false;
  }

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    target.geocode = {
      status: 'miss',
      query: usedQuery,
      displayName: hit.display_name || null,
      placeId: hit.place_id != null ? hit.place_id : null
    };
    target.lat = null;
    target.lng = null;
    return false;
  }

  target.lat = lat;
  target.lng = lng;
  target.geocode = {
    status: 'ok',
    query: usedQuery,
    displayName: hit.display_name || null,
    placeId: hit.place_id != null ? hit.place_id : null
  };
  return true;
}

async function main() {
  const dry = process.env.BORDEAUX_GEOCODE_DRY_RUN === '1';
  const limit = process.env.BORDEAUX_GEOCODE_LIMIT
    ? Math.max(0, parseInt(process.env.BORDEAUX_GEOCODE_LIMIT, 10) || 0)
    : 0;

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('bordeaux-zones.json: missing items[]');
  }

  // Origin
  if (data.origin && (!Number.isFinite(data.origin.lat) || !Number.isFinite(data.origin.lng))) {
    const { hit, usedQuery } = await geocodeOrigin(data.origin);
    const ok = applyHit(data.origin, hit, usedQuery);
    console.log(ok ? 'ORIGIN OK' : 'ORIGIN MISS', usedQuery);
  }

  let n = 0;
  for (const item of data.items) {
    n++;
    if (limit > 0 && n > limit) break;

    if (!needsGeocode(item)) {
      console.log('skip (already has coords):', item.id);
      continue;
    }

    const { hit, usedQuery } = await geocodeOneItem(item);
    const ok = applyHit(item, hit, usedQuery);
    if (ok) console.log('OK', item.id, item.lat.toFixed(5), item.lng.toFixed(5));
    else console.warn('MISS', item.id, usedQuery);
  }

  if (!dry) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('Written:', DATA_FILE);
  } else {
    console.log('Dry run: no write.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

