/**
 * Geocode map-data/mtb-downhill-fr-seed.json via Nominatim search → mtb-downhill-fr-curated.json
 *
 * Policy: ~1 request/s, identifiable User-Agent (see https://operations.osmfoundation.org/policies/nominatim/).
 *
 * Env:
 *   MTB_GEOCODE_LIMIT=n — process at most n items
 *   MTB_GEOCODE_DRY_RUN=1 — print only, no write
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const SEED_FILE = path.join(BASE, 'map-data', 'mtb-downhill-fr-seed.json');
const OUT_FILE = path.join(BASE, 'map-data', 'mtb-downhill-fr-curated.json');

const USER_AGENT =
  process.env.NOMINATIM_UA ||
  'usa-interactive-map/2.0 (France MTB curated geocode; local dev)';
const DELAY_MS = Math.max(1050, Number(process.env.NOMINATIM_DELAY_MS) || 1100);

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

function pickAddressCity(addr) {
  if (!addr || typeof addr !== 'object') return null;
  for (const k of [
    'city',
    'town',
    'village',
    'municipality',
    'hamlet',
    'locality'
  ]) {
    const v = addr[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return null;
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

async function main() {
  const dry = process.env.MTB_GEOCODE_DRY_RUN === '1';
  const limitRaw = process.env.MTB_GEOCODE_LIMIT;
  const limit = limitRaw ? Math.max(0, parseInt(limitRaw, 10) || 0) : 0;

  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const items = seed.items;
  if (!Array.isArray(items)) throw new Error('seed.items must be an array');

  const out = [];
  let skipped = 0;
  let i = 0;

  for (const row of items) {
    i++;
    if (limit > 0 && i > limit) break;
    const query = row.query || row.name;
    if (!query) {
      console.warn('skip (no query):', row.id);
      skipped++;
      continue;
    }

    await sleep(DELAY_MS);
    let hit = null;
    try {
      hit = await searchNominatim(query);
    } catch (e) {
      console.warn('Nominatim error', row.id, e.message);
    }

    if (!hit) {
      await sleep(DELAY_MS);
      try {
        const simple = String(row.name || '').replace(/—.*/u, '').trim() + ', France';
        hit = await searchNominatim(simple);
      } catch (e) {
        console.warn('fallback error', row.id, e.message);
      }
    }

    if (!hit) {
      console.warn('MISS', row.id, query);
      skipped++;
      continue;
    }

    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      console.warn('bad coords', row.id);
      skipped++;
      continue;
    }

    const addr = hit.address || {};
    const city = pickAddressCity(addr);

    out.push({
      id: row.id,
      name: row.name,
      lat,
      lng,
      city: city || null,
      url: row.url || null,
      mtbProfile: 'downhill',
      source: 'curated_nominatim',
      nominatimPlaceId: hit.place_id != null ? hit.place_id : null,
      nominatimDisplayName: hit.display_name || null,
      seedQuery: query
    });

    console.log('OK', row.id, lat.toFixed(5), lng.toFixed(5), city || '');
  }

  console.log('---');
  console.log('Written', out.length, 'geocoded; skipped/miss', skipped);

  if (!dry) {
    fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n', 'utf8');
    console.log('→', OUT_FILE);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
