/**
 * Enrich map-data/bordeaux-zones.json with DVF house price aggregates (€/m²).
 *
 * Data sources:
 * - Commune lookup by lat/lng: https://geo.api.gouv.fr/communes?lat=...&lon=...
 * - DVF géolocalisées (official): https://files.data.gouv.fr/geo-dvf/latest/csv/{year}/departements/33.csv.gz
 *
 * Output: updates map-data/bordeaux-zones.json in-place (adds item.immo.dvfMaison + item.immo.inseeCommune).
 *
 * Notes:
 * - We only store aggregates (median / quartiles) to avoid exposing transaction-level details.
 * - This script scans department-level DVF files and keeps only Vente + Maison, with basic outlier filters.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const BASE = path.resolve(__dirname, '..');
const IN_FILE = path.join(BASE, 'map-data', 'bordeaux-zones.json');

const GEO_API = 'https://geo.api.gouv.fr/communes';
const DVF_FILES_BASE = 'https://files.data.gouv.fr/geo-dvf/latest/csv';
const DVF_YEARS = [2021, 2022, 2023, 2024, 2025];
const DVF_DEPT = '33'; // Gironde

const DEFAULTS = {
  delayMs: 650,
  surfaceMin: 30,
  surfaceMax: 250,
  eurM2Min: 1000,
  eurM2Max: 10000,
  maxTransactions: 5000
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'usa-interactive-map (DVF enrich Bordeaux) / Nicolas Marchand',
          'Accept': 'application/json'
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          const trimmed = String(data || '').trimStart();
          if (trimmed.startsWith('<')) {
            return reject(new Error(`Non-JSON response (HTML) from ${url}`));
          }
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON from ${url}: ${e.message}`));
          }
        });
      }
    );
    req.on('error', reject);
  });
}

function fetchStream(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'usa-interactive-map (DVF enrich Bordeaux) / Nicolas Marchand',
          'Accept': '*/*'
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        resolve(res);
      }
    );
    req.on('error', reject);
  });
}

function q(arr, p) {
  if (!arr.length) return null;
  const a = arr.slice().sort((x, y) => x - y);
  const i = (a.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return a[lo];
  const w = i - lo;
  return a[lo] * (1 - w) + a[hi] * w;
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function asNumber(v) {
  if (v == null) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

async function communeFromLatLng(lat, lon) {
  const u = new URL(GEO_API);
  u.searchParams.set('lat', String(lat));
  u.searchParams.set('lon', String(lon));
  u.searchParams.set('fields', 'nom,code,codeDepartement,codeRegion');
  u.searchParams.set('format', 'json');
  const data = await fetchJson(u.toString());
  if (!Array.isArray(data) || !data.length) return null;
  return data[0];
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

async function collectDvfeurM2ByCommune(communeCodesSet, filters) {
  const eurM2ByCommune = new Map(); // code_commune -> number[]
  for (const code of communeCodesSet) eurM2ByCommune.set(String(code), []);

  for (const year of DVF_YEARS) {
    const url = `${DVF_FILES_BASE}/${year}/departements/${DVF_DEPT}.csv.gz`;
    // eslint-disable-next-line no-console
    console.log(`DVF: download+scan ${url}`);
    const res = await fetchStream(url);
    const gunzip = zlib.createGunzip();
    const stream = res.pipe(gunzip);

    let header = null;
    let idx = null;
    let buf = '';

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        buf += chunk.toString('utf8');
        while (true) {
          const j = buf.indexOf('\n');
          if (j < 0) break;
          const raw = buf.slice(0, j);
          buf = buf.slice(j + 1);
          const line = raw.replace(/\r$/, '');
          if (!line) continue;

          if (!header) {
            header = parseCsvLine(line);
            const pos = {};
            header.forEach((h, i) => { pos[h] = i; });
            idx = {
              code_commune: pos.code_commune,
              nature_mutation: pos.nature_mutation,
              type_local: pos.type_local,
              valeur_fonciere: pos.valeur_fonciere,
              surface_reelle_bati: pos.surface_reelle_bati
            };
            return;
          }

          if (!idx || idx.code_commune == null) continue;
          const cols = parseCsvLine(line);
          const codeCommune = cols[idx.code_commune];
          if (!eurM2ByCommune.has(codeCommune)) continue;

          if (cols[idx.nature_mutation] !== 'Vente') continue;
          if (cols[idx.type_local] !== 'Maison') continue;
          const val = asNumber(cols[idx.valeur_fonciere]);
          const surf = asNumber(cols[idx.surface_reelle_bati]);
          if (!Number.isFinite(val) || !Number.isFinite(surf) || val <= 0 || surf <= 0) continue;

          if (surf < filters.surfaceMin || surf > filters.surfaceMax) continue;
          const p = val / surf;
          if (!Number.isFinite(p) || p < filters.eurM2Min || p > filters.eurM2Max) continue;

          eurM2ByCommune.get(codeCommune).push(p);
        }
      });
      stream.on('end', resolve);
      stream.on('error', reject);
      gunzip.on('error', reject);
      res.on('error', reject);
    });

    await sleep(DEFAULTS.delayMs);
  }

  return eurM2ByCommune;
}

function computeEurM2Stats(eurM2, filters) {
  const filtered = eurM2.filter((p) => Number.isFinite(p) && p >= filters.eurM2Min && p <= filters.eurM2Max);
  const median = q(filtered, 0.5);
  const p25 = q(filtered, 0.25);
  const p75 = q(filtered, 0.75);
  return {
    status: filtered.length ? 'ok' : 'no_data',
    txCountRaw: eurM2.length,
    txCountKept: filtered.length,
    txCountDropped: eurM2.length - filtered.length,
    medianEurM2: median == null ? null : round2(median),
    p25EurM2: p25 == null ? null : round2(p25),
    p75EurM2: p75 == null ? null : round2(p75)
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  const zones = readJson(IN_FILE);
  if (!zones || !Array.isArray(zones.items)) {
    throw new Error('Invalid bordeaux-zones.json: missing items[]');
  }

  const filters = {
    surfaceMin: DEFAULTS.surfaceMin,
    surfaceMax: DEFAULTS.surfaceMax,
    eurM2Min: DEFAULTS.eurM2Min,
    eurM2Max: DEFAULTS.eurM2Max
  };

  zones.immo = zones.immo || {};
  zones.immo.dvfMaison = zones.immo.dvfMaison || {};
  zones.immo.dvfMaison.source = {
    label: 'DVF géolocalisées (fichiers data.gouv.fr, par département)',
    url: `${DVF_FILES_BASE}/`
  };
  zones.immo.dvfMaison.filters = filters;
  zones.immo.dvfMaison.updatedAt = new Date().toISOString();

  const neededCommuneCodes = new Set();

  for (const item of zones.items) {
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) continue;

    item.immo = item.immo || {};
    if (!force && item.immo.dvfMaison && item.immo.dvfMaison.status === 'ok') continue;

    await sleep(DEFAULTS.delayMs);
    const c = await communeFromLatLng(item.lat, item.lng);
    if (!c || !c.code) {
      item.immo.inseeCommune = { status: 'miss', code: null, name: null, fetchedAt: new Date().toISOString() };
      item.immo.dvfMaison = { status: 'miss', reason: 'no_commune', fetchedAt: new Date().toISOString() };
      continue;
    }

    item.immo.inseeCommune = {
      status: 'ok',
      code: String(c.code),
      name: String(c.nom || ''),
      fetchedAt: new Date().toISOString(),
      sourceUrl: `${GEO_API}?lat=${encodeURIComponent(item.lat)}&lon=${encodeURIComponent(item.lng)}`
    };
    neededCommuneCodes.add(String(c.code));
  }

  const eurM2ByCommune = await collectDvfeurM2ByCommune(neededCommuneCodes, filters);

  for (const item of zones.items) {
    item.immo = item.immo || {};
    const ic = item.immo.inseeCommune;
    if (!ic || ic.status !== 'ok' || !ic.code) continue;
    const eurM2 = eurM2ByCommune.get(String(ic.code)) || [];
    const stats = computeEurM2Stats(eurM2, filters);
    item.immo.dvfMaison = {
      ...stats,
      fetchedAt: new Date().toISOString(),
      department: DVF_DEPT,
      years: DVF_YEARS
    };
  }

  if (!dryRun) {
    writeJson(IN_FILE, zones);
    // eslint-disable-next-line no-console
    console.log('Written:', IN_FILE);
  } else {
    // eslint-disable-next-line no-console
    console.log('Dry run: no write.');
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

