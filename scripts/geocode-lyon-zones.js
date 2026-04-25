/**
 * Geocode map-data/lyon-zones.json via Nominatim (search).
 *
 * Policy: ≥1 request/s, identifiable User-Agent
 * (https://operations.osmfoundation.org/policies/nominatim/).
 *
 * Env:
 *   NOMINATIM_UA — custom User-Agent
 *   NOMINATIM_EMAIL — optional contact (recommended)
 *   NOMINATIM_DELAY_MS — min delay between requests (default 1100)
 *   LYON_GEOCODE_DRY_RUN=1 — no write
 *   LYON_GEOCODE_LIMIT=n — max items to process
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const DATA_FILE = path.join(BASE, 'map-data', 'lyon-zones.json');

const USER_AGENT =
  process.env.NOMINATIM_UA ||
  'usa-interactive-map/2.0 (Lyon zones geocode; local dev)';
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

function communesFallbackQuery(name) {
  return `${name}, Rhône, France`;
}

function defaultArrondissementQuery(name) {
  if (/\b1er\b|1e arrondissement/i.test(name) || /Lyon\s*1\b/.test(name)) {
    return 'Lyon 1er arrondissement, France';
  }
  const m = name.match(/(\d+)\s*e/);
  if (m) {
    return `Lyon ${m[1]}e arrondissement, France`;
  }
  return `${name}, France`;
}

async function geocodeOneItem(item) {
  if (item.kind === 'commune') {
    const q1 = item.geocodeQuery || `${item.name}, Métropole de Lyon, France`;
    await sleep(DELAY_MS);
    let hit = await searchNominatim(q1);
    let usedQuery = q1;
    if (!hit) {
      const q2 = communesFallbackQuery(item.name);
      usedQuery = q2;
      await sleep(DELAY_MS);
      hit = await searchNominatim(q2);
    }
    return { hit, usedQuery };
  }

  if (item.kind === 'arrondissement') {
    const q1 = item.geocodeQuery || defaultArrondissementQuery(item.name);
    await sleep(DELAY_MS);
    let hit = await searchNominatim(q1);
    const usedQuery = q1;
    if (!hit) {
      const m = item.name.match(/(\d+)/);
      if (m) {
        const q2 = `${m[1]}e arrondissement, Lyon, France`;
        await sleep(DELAY_MS);
        hit = await searchNominatim(q2);
        if (hit) {
          return { hit, usedQuery: q2 };
        }
      }
    }
    if (!hit) {
      const q3 = `Lyon ${item.name.replace(/^Lyon\s*/i, '').trim()}, France`;
      await sleep(DELAY_MS);
      hit = await searchNominatim(q3);
      if (hit) return { hit, usedQuery: q3 };
    }
    return { hit, usedQuery };
  }

  return { hit: null, usedQuery: item.id };
}

function needsGeocode(item) {
  return (
    !Number.isFinite(item.lat) ||
    !Number.isFinite(item.lng)
  );
}

async function main() {
  const dry = process.env.LYON_GEOCODE_DRY_RUN === '1';
  const limit = process.env.LYON_GEOCODE_LIMIT
    ? Math.max(0, parseInt(process.env.LYON_GEOCODE_LIMIT, 10) || 0)
    : 0;

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('lyon-zones.json: missing items[]');
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

    if (!hit) {
      item.geocode = {
        status: 'miss',
        query: usedQuery,
        displayName: null,
        placeId: null
      };
      item.lat = null;
      item.lng = null;
      console.warn('MISS', item.id, usedQuery);
      continue;
    }

    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      item.geocode = {
        status: 'miss',
        query: usedQuery,
        displayName: hit.display_name || null,
        placeId: hit.place_id != null ? hit.place_id : null
      };
      console.warn('bad coords', item.id);
      continue;
    }

    item.lat = lat;
    item.lng = lng;
    item.geocode = {
      status: 'ok',
      query: usedQuery,
      displayName: hit.display_name || null,
      placeId: hit.place_id != null ? hit.place_id : null
    };
    console.log('OK', item.id, lat.toFixed(5), lng.toFixed(5));
  }

  if (!dry) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log('→', DATA_FILE);
  } else {
    console.log('(dry run, not written)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
