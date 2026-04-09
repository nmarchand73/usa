/**
 * Annuaire FFM Engage — circuits « tout terrain » (listing type=tt) par ligue.
 * Défaut : ligue 62995 (Nouvelle-Aquitaine), comme sur la page liste officielle.
 *
 * Extraction : URLs « Voir la page » uniquement, puis fiche (h1, type piste, CP/commune).
 * Géocodage : Nominatim (1 req/s, User-Agent obligatoire — voir politique OSM).
 *
 * Usage :
 *   node scripts/fetch-ffm-circuits-tt-fr.js
 *   node scripts/fetch-ffm-circuits-tt-fr.js --no-geocode
 *   node scripts/fetch-ffm-circuits-tt-fr.js --ligue=84 --label=LIGUE_EXAMPLE
 *   node scripts/fetch-ffm-circuits-tt-fr.js --only-geocode
 *     → relit map-data/ffm-circuits-tt-nouvelle-aquitaine.json, ne regéocode que les lignes non OK
 *
 * Env :
 *   FFM_DELAY_MS=900     délai entre requêtes engage-sports.com
 *   NOMINATIM_DELAY_MS=1100
 *   NOMINATIM_UA=...     User-Agent pour Nominatim
 *   NOMINATIM_EMAIL=...  recommandé par Nominatim pour usage suivi
 *   FFM_GEOCODE_LIMIT=n  ne géocoder que les n premières fiches (test)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_DIR = path.join(__dirname, '..');
const DEFAULT_OUT = path.join(BASE_DIR, 'map-data', 'ffm-circuits-tt-nouvelle-aquitaine.json');

const FFM_BASE = 'https://ffm.engage-sports.com';
const FFM_UA = 'usa-interactive-map/2.0 (FFM annuaire circuits TT; research; local dev)';
const FFM_DELAY_MS = Math.max(400, Number(process.env.FFM_DELAY_MS) || 900);
const NOMINATIM_DELAY_MS = Math.max(1050, Number(process.env.NOMINATIM_DELAY_MS) || 1100);
const NOMINATIM_UA =
  process.env.NOMINATIM_UA || 'usa-interactive-map/2.0 (FFM TT geocode; local dev)';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const out = {
    ligue: '62995',
    label: 'Nouvelle-Aquitaine',
    geocode: true,
    outPath: DEFAULT_OUT,
    geocodeLimit: 0,
    onlyGeocode: false
  };
  for (const a of argv) {
    if (a === '--no-geocode') out.geocode = false;
    if (a === '--only-geocode') out.onlyGeocode = true;
    if (a.startsWith('--ligue=')) out.ligue = a.slice('--ligue='.length).trim();
    if (a.startsWith('--label=')) out.label = a.slice('--label='.length).trim();
    if (a.startsWith('--out=')) out.outPath = path.resolve(a.slice('--out='.length).trim());
    if (a.startsWith('--geocode-limit='))
      out.geocodeLimit = Math.max(0, parseInt(a.slice('--geocode-limit='.length), 10) || 0);
  }
  return out;
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: Object.assign({ 'User-Agent': FFM_UA, Accept: 'text/html,*/*' }, headers || {})
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
          else reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('timeout')));
  });
}

function httpsGetJson(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: Object.assign({ 'User-Agent': NOMINATIM_UA, Accept: 'application/json' }, headers) },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(raw));
            } catch (e) {
              reject(new Error(`JSON: ${e.message}`));
            }
          } else reject(new Error(`HTTP ${res.statusCode}`));
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
  });
}

/** Liens fiche circuit depuis une page liste (évite le bruit des 118 href sidebar). */
function listPageCircuitPaths(html) {
  const re = /href="(\/annuaire\/circuits\/FR\/[^"]+)"[^>]*>\s*Voir la page/gi;
  const set = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const p = m[1].replace(/&amp;/g, '&');
    if (p === '/annuaire/circuits/FR/') continue;
    set.add(p);
  }
  return [...set];
}

function listingUrl(ligue, page) {
  const q = new URLSearchParams();
  q.set('q', '');
  q.set('type', 'tt');
  q.set('ligue', ligue);
  if (page > 1) q.set('page', String(page));
  return `${FFM_BASE}/annuaire/circuits-tout-terrain/?${q.toString()}`;
}

async function collectAllPaths(ligue) {
  const all = new Set();
  let page = 1;
  while (page < 80) {
    await sleep(FFM_DELAY_MS);
    const html = await httpsGet(listingUrl(ligue, page));
    const paths = listPageCircuitPaths(html);
    if (!paths.length) {
      if (page === 1) console.warn('Aucun lien « Voir la page » sur la page 1 — vérifier --ligue=');
      break;
    }
    for (const p of paths) all.add(p);
    page++;
  }
  return [...all].sort();
}

function stripTags(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(s) {
  if (s == null || s === '') return s;
  let t = String(s);
  t = t.replace(/&apos;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
  t = t.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
  t = t.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  t = t.replace(/&amp;/g, '&');
  return t;
}

function cleanCityLine(s) {
  if (!s) return null;
  let t = decodeEntities(s.trim());
  const lo = t.toLowerCase();
  const http = lo.indexOf('http');
  if (http >= 0) t = t.slice(0, http).trim();
  t = t.replace(/\s+/g, ' ');
  return t || null;
}

function parseDetail(html, path) {
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name = h1m ? decodeEntities(stripTags(h1m[1])) : null;

  let circuitType = null;
  const ct = html.match(/<p class="asc-c-Heading-h3"[^>]*>\s*([^<]+?)\s*<\/p>/i);
  if (ct) circuitType = String(ct[1]).trim();

  let addressLine1 = null;
  let postalCode = null;
  let cityLine = null;
  const adIdx = html.indexOf('>Adresse<');
  if (adIdx >= 0) {
    const chunk = html.slice(adIdx, adIdx + 3500);
    const bold = chunk.match(/block mb-12 font-bold"[^>]*>([^<]*)</i);
    if (bold && bold[1].trim()) {
      const b = bold[1].trim();
      if (!/^none$/i.test(b)) addressLine1 = b;
    }
    const cpMatch = chunk.match(/\b(\d{5})\s+([^<]+)<\/span>/);
    if (cpMatch) {
      postalCode = cpMatch[1];
      cityLine = cleanCityLine(stripTags(cpMatch[2]));
    }
  }

  const slug = path.replace(/^\/annuaire\/circuits\/FR\//, '').replace(/\/$/, '');
  const url = FFM_BASE + path;

  return {
    slug,
    url,
    name,
    circuitType,
    addressLine1: addressLine1 || null,
    postalCode,
    cityLine,
    geocodeStatus: null,
    lat: null,
    lng: null,
    nominatimQuery: null,
    nominatimDisplayName: null
  };
}

async function searchNominatim(q) {
  const u = new URL('https://nominatim.openstreetmap.org/search');
  u.searchParams.set('q', q);
  u.searchParams.set('format', 'json');
  u.searchParams.set('limit', '1');
  u.searchParams.set('countrycodes', 'fr');
  u.searchParams.set('addressdetails', '1');
  if (process.env.NOMINATIM_EMAIL) u.searchParams.set('email', process.env.NOMINATIM_EMAIL);
  const arr = await httpsGetJson(u.toString(), { 'Accept-Language': 'fr' });
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

async function geocodeRow(row, regionLabel) {
  const queries = [];
  if (row.postalCode && row.cityLine) queries.push(`${row.postalCode} ${row.cityLine}, France`);
  if (row.cityLine && row.postalCode) queries.push(`${row.cityLine}, ${row.postalCode}, France`);
  if (row.name && row.cityLine) queries.push(`${row.name}, ${row.cityLine}, France`);
  if (row.name && row.postalCode) queries.push(`${row.name} ${row.postalCode}, France`);
  if (row.name && regionLabel)
    queries.push(`${row.name} moto cross, ${regionLabel}, France`);
  if (row.name) queries.push(`${row.name}, France`);

  let hit = null;
  let usedQuery = null;
  for (const q of queries) {
    await sleep(NOMINATIM_DELAY_MS);
    try {
      hit = await searchNominatim(q);
    } catch (e) {
      console.warn('Nominatim:', e.message);
      hit = null;
    }
    if (hit) {
      usedQuery = q;
      break;
    }
  }

  if (!hit) {
    row.geocodeStatus = 'miss';
    return;
  }

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    row.geocodeStatus = 'miss';
    return;
  }

  row.lat = lat;
  row.lng = lng;
  row.geocodeStatus = 'ok';
  row.nominatimQuery = usedQuery;
  row.nominatimDisplayName = hit.display_name || null;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  let circuits;

  if (opts.onlyGeocode) {
    if (!fs.existsSync(opts.outPath)) {
      console.error('Fichier manquant:', opts.outPath);
      process.exit(1);
    }
    const prev = JSON.parse(fs.readFileSync(opts.outPath, 'utf8'));
    circuits = prev.circuits;
    if (!Array.isArray(circuits)) {
      console.error('JSON invalide: circuits[] attendu');
      process.exit(1);
    }
    console.log('--only-geocode:', opts.outPath, '—', circuits.length, 'lignes');
    for (const row of circuits) {
      row.name = row.name != null ? decodeEntities(String(row.name)) : row.name;
      row.cityLine = cleanCityLine(row.cityLine);
    }
  } else {
    console.log('Ligue', opts.ligue, opts.label);
    console.log('Collecte des fiches (liste paginée)…');
    const paths = await collectAllPaths(opts.ligue);
    console.log('Fiches uniques:', paths.length);

    circuits = [];
    let i = 0;
    for (const p of paths) {
      i++;
      await sleep(FFM_DELAY_MS);
      const html = await httpsGet(FFM_BASE + p);
      const row = parseDetail(html, p.endsWith('/') ? p : p + '/');
      circuits.push(row);
      if (i % 20 === 0 || i === paths.length) console.log('  détail', i, '/', paths.length);
    }
  }

  if (opts.geocode) {
    console.log('Géocodage Nominatim…');
    let n = 0;
    for (const row of circuits) {
      if (opts.onlyGeocode && row.geocodeStatus === 'ok' && row.lat != null && row.lng != null) {
        continue;
      }
      if (opts.geocodeLimit > 0 && n >= opts.geocodeLimit) {
        if (row.geocodeStatus !== 'ok') row.geocodeStatus = 'skipped';
        continue;
      }
      await geocodeRow(row, opts.label);
      n++;
      if (n % 10 === 0) console.log('  geocode', n);
    }
    if (opts.geocodeLimit > 0)
      console.log('(limite --geocode-limit=', opts.geocodeLimit, '— le reste sans coords)');
  } else {
    for (const row of circuits) row.geocodeStatus = 'skipped';
  }

  const ok = circuits.filter((c) => c.geocodeStatus === 'ok').length;
  const miss = circuits.filter((c) => c.geocodeStatus === 'miss').length;

  let metaBase;
  if (opts.onlyGeocode) {
    metaBase = JSON.parse(fs.readFileSync(opts.outPath, 'utf8'));
  } else {
    metaBase = {};
  }
  const payload = {
    source: metaBase.source || 'FFM Engage',
    listingType: metaBase.listingType || 'tt',
    ligueId: metaBase.ligueId || opts.ligue,
    ligueLabel: metaBase.ligueLabel || opts.label,
    fetchedAt: metaBase.fetchedAt || new Date().toISOString(),
    lastGeocodedAt: opts.geocode ? new Date().toISOString() : metaBase.lastGeocodedAt || null,
    count: circuits.length,
    geocodeSummary: opts.geocode ? { ok, miss, skipped: circuits.length - ok - miss } : null,
    circuits
  };

  fs.mkdirSync(path.dirname(opts.outPath), { recursive: true });
  fs.writeFileSync(opts.outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log('Écrit:', opts.outPath);
  console.log('Géocode OK:', ok, 'miss:', miss);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
