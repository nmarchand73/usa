/**
 * Enrich map-data/venues-map-fr.json with city (commune) when missing.
 *
 * 1) Heuristic from name: "Bike Park de Mougins" → Mougins
 * 2) Nominatim reverse geocoding (cached in map-data/nominatim-venue-cache.json)
 *
 * Policy: max ~1 req/s to nominatim.openstreetmap.org (see Usage Policy).
 *
 * Env:
 *   ENRICH_LIMIT=n   — process at most n new Nominatim lookups (for tests)
 *   ENRICH_DRY_RUN=1 — print stats only, do not write venues file
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const VENUES_FILE = path.join(BASE, 'map-data', 'venues-map-fr.json');
const CACHE_FILE = path.join(BASE, 'map-data', 'nominatim-venue-cache.json');

const USER_AGENT =
  process.env.NOMINATIM_UA ||
  'usa-interactive-map/2.0 (France venues enrich; https://github.com/)';
const DELAY_MS = Math.max(1050, Number(process.env.NOMINATIM_DELAY_MS) || 1100);

function readJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

/** Round for cache key (~11 m precision) */
function coordKey(lat, lng) {
  return (
    Math.round(Number(lat) * 1e5) / 1e5 + ',' + Math.round(Number(lng) * 1e5) / 1e5
  );
}

function needsCity(v) {
  const c = v.city;
  if (c == null) return true;
  if (typeof c === 'string' && !c.trim()) return true;
  return false;
}

/**
 * Infer commune from French name patterns.
 */
function inferCityFromName(name) {
  if (!name || typeof name !== 'string') return null;
  const t = name.replace(/\s+/g, ' ').trim();
  const patterns = [
    /\b(?:de|du|des|d')\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-\s\d]{1,55})$/iu,
    /\bà\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'\-\s\d]{1,55})$/iu
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (!m) continue;
    let c = m[1].trim();
    c = c.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    c = c.replace(/\s+(bike park|parc vtt|pump ?track|bmx|VTT)\s*$/i, '').trim();
    if (c.length >= 2 && c.length <= 60) return c;
  }
  return null;
}

function pickAddressCity(addr) {
  if (!addr || typeof addr !== 'object') return null;
  const keys = [
    'city',
    'town',
    'village',
    'municipality',
    'hamlet',
    'suburb',
    'neighbourhood',
    'locality'
  ];
  for (const k of keys) {
    const v = addr[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return null;
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
    req.setTimeout(30000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function reverseNominatim(lat, lng) {
  const u = new URL('https://nominatim.openstreetmap.org/reverse');
  u.searchParams.set('lat', String(lat));
  u.searchParams.set('lon', String(lng));
  u.searchParams.set('format', 'json');
  u.searchParams.set('addressdetails', '1');
  u.searchParams.set('zoom', '12');
  u.searchParams.set('email', process.env.NOMINATIM_EMAIL || '');
  return httpsGetJson(u.toString());
}

async function main() {
  const dry = process.env.ENRICH_DRY_RUN === '1';
  const limitRaw = process.env.ENRICH_LIMIT;
  const limit = limitRaw ? Math.max(0, parseInt(limitRaw, 10) || 0) : 0;

  const venues = readJson(VENUES_FILE, null);
  if (!venues || !Array.isArray(venues.mtbBikeParks)) {
    throw new Error('Invalid venues JSON');
  }

  const pumptracks = Array.isArray(venues.pumptracks) ? venues.pumptracks : [];
  const bmxTracks = Array.isArray(venues.bmxTracks) ? venues.bmxTracks : [];
  const yellohVillageCampings = Array.isArray(venues.yellohVillageCampings)
    ? venues.yellohVillageCampings
    : [];

  const cache = readJson(CACHE_FILE, {});
  const lists = [
    { key: 'mtbBikeParks', items: venues.mtbBikeParks },
    { key: 'pumptracks', items: pumptracks },
    { key: 'bmxTracks', items: bmxTracks },
    { key: 'yellohVillageCampings', items: yellohVillageCampings }
  ];

  let inferCount = 0;
  for (const { items } of lists) {
    for (const v of items) {
      if (!needsCity(v)) continue;
      const guess = inferCityFromName(v.name);
      if (guess) {
        v.city = guess;
        v.citySource = 'name_heuristic';
        inferCount++;
      }
    }
  }

  /** Unique coords still missing city */
  const pendingByKey = new Map();
  for (const { items } of lists) {
    for (const v of items) {
      if (!needsCity(v)) continue;
      const lat = Number(v.lat);
      const lng = Number(v.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const k = coordKey(lat, lng);
      if (!pendingByKey.has(k)) pendingByKey.set(k, { lat, lng });
    }
  }

  let geoLookups = 0;
  let fromCache = 0;
  let nomiErrors = 0;

  for (const [k, { lat, lng }] of pendingByKey) {
    if (cache[k] && cache[k].city) {
      fromCache++;
      continue;
    }
    if (limit > 0 && geoLookups >= limit) break;

    try {
      const j = await reverseNominatim(lat, lng);
      const city = pickAddressCity(j && j.address);
      cache[k] = {
        city: city || null,
        displayName: j && j.display_name ? String(j.display_name) : null,
        fetchedAt: new Date().toISOString()
      };
      geoLookups++;
      if (geoLookups % 25 === 0 && !dry) writeJson(CACHE_FILE, cache);
    } catch (e) {
      nomiErrors++;
      cache[k] = { city: null, error: String(e.message), fetchedAt: new Date().toISOString() };
      geoLookups++;
      console.warn('Nominatim error', k, e.message);
    }
    await sleep(DELAY_MS);
  }

  /** Apply cache to venues */
  let applied = 0;
  for (const { items } of lists) {
    for (const v of items) {
      if (!needsCity(v)) continue;
      const lat = Number(v.lat);
      const lng = Number(v.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const k = coordKey(lat, lng);
      const c = cache[k];
      if (c && c.city) {
        v.city = c.city;
        v.citySource = 'nominatim';
        applied++;
      }
    }
  }

  const allVenueItems = lists.flatMap((l) => l.items);
  const stillMissing = allVenueItems.filter(needsCity).length;
  const heuristicTotal = allVenueItems.filter((v) => v.citySource === 'name_heuristic').length;
  const nominatimTotal = allVenueItems.filter((v) => v.citySource === 'nominatim').length;

  venues._venuesMeta = {
    enrichedAt: new Date().toISOString().slice(0, 10),
    inferFromNameThisRun: inferCount,
    totalCityFromNameHeuristic: heuristicTotal,
    totalCityFromNominatim: nominatimTotal,
    nominatimLookupsThisRun: geoLookups,
    nominatimFromCacheHits: fromCache,
    nominatimErrors: nomiErrors,
    stillMissingCity: stillMissing,
    references: [
      'https://www.kelbikepark.fr/fr/classement-des-bike-parks-vtt',
      'https://owlaps.fr/',
      'https://nominatim.org/release-docs/develop/api/Reverse/'
    ],
    note:
      'city complétée par heuristique sur le nom et/ou géocodage Nominatim (OSMF). Respecter la politique d’usage Nominatim (1 req/s).'
  };

  if (!dry) {
    writeJson(CACHE_FILE, cache);
    writeJson(VENUES_FILE, venues);
    console.log('Written:', VENUES_FILE);
  }

  console.log(
    JSON.stringify(
      {
        inferFromName: inferCount,
        newNominatimRequests: geoLookups,
        cacheHitsBeforeRun: fromCache,
        nominatimErrors: nomiErrors,
        appliedFromCache: applied,
        stillMissingCity: stillMissing,
        dryRun: dry
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
