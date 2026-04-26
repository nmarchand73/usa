/**
 * Build a coarse raster "heatmap" of DVF house €/m² (median per grid cell) around Bordeaux.
 *
 * Source: DVF géolocalisées — fichiers département 33 par année
 *   https://files.data.gouv.fr/geo-dvf/latest/csv/{YEAR}/departements/33.csv.gz
 *
 * Output:
 *   - public/bordeaux-dvf-heatmap.json (eurM2 = toutes maisons ; eurM2T4p = ≥4 pièces DVF, T4/T5+)
 *
 * Privacy/robustness:
 * - We only store per-cell medians and counts, not individual sales.
 * - Cells with too few sales are left empty (transparent) on the map.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const BASE = path.resolve(__dirname, '..');
const ZONES = path.join(BASE, 'map-data', 'bordeaux-zones.json');
const OUT = path.join(BASE, 'public', 'bordeaux-dvf-heatmap.json');

const DVF_BASE = 'https://files.data.gouv.fr/geo-dvf/latest/csv';
const DVF_DEPT = '33';
const YEARS = [2021, 2022, 2023, 2024, 2025];

const DEFAULTS = {
  radiusKm: 35,
  gridNx: 90,
  gridNy: 90,
  minCellCount: 5,
  minCellCountT4: 4,
  minPiecesT4: 4,
  surfaceMin: 30,
  surfaceMax: 250,
  eurM2Min: 1000,
  eurM2Max: 10000,
  maxPerCell: 4000
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function asNumber(v) {
  if (v == null) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function q(arr, p) {
  if (!arr || !arr.length) return null;
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

function fetchStream(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { 'User-Agent': 'usa-interactive-map (DVF heatmap) / build', 'Accept': '*/*' } },
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

function degOffsetLat(km) {
  return km / 111.0;
}

function degOffsetLng(km, lat) {
  const c = Math.cos((lat * Math.PI) / 180);
  const d = 111.0 * (c < 0.1 ? 0.1 : c);
  return km / d;
}

class CellAcc {
  constructor() {
    this.v = [];
  }
  push(n) {
    if (!Number.isFinite(n)) return;
    this.v.push(n);
    if (this.v.length > DEFAULTS.maxPerCell) {
      this.v = this.v.slice(this.v.length - DEFAULTS.maxPerCell);
    }
  }
  median() {
    return q(this.v, 0.5);
  }
  count() {
    return this.v.length;
  }
}

async function scanYearToCells(year, bbox, stepLat, stepLng, minLat, minLng, idxW, acc, accT4) {
  const url = `${DVF_BASE}/${year}/departements/${DVF_DEPT}.csv.gz`;
  // eslint-disable-next-line no-console
  console.log('DVF heatmap: scan', url);

  const res = await fetchStream(url);
  const gunzip = zlib.createGunzip();
  const stream = res.pipe(gunzip);

  let header = null;
  let col = null;
  let buf = '';
  let lines = 0;

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
        lines++;

        if (!header) {
          header = parseCsvLine(line);
          const pos = {};
          header.forEach((h, i) => { pos[h] = i; });
          col = {
            nature_mutation: pos.nature_mutation,
            type_local: pos.type_local,
            valeur_fonciere: pos.valeur_fonciere,
            surface_reelle_bati: pos.surface_reelle_bati,
            nombre_pieces_principales: pos.nombre_pieces_principales,
            latitude: pos.latitude,
            longitude: pos.longitude
          };
          if (col.nombre_pieces_principales == null) {
            // eslint-disable-next-line no-console
            console.warn('DVF heatmap: missing column nombre_pieces_principales — couche T4+ indisponible');
          }
          continue;
        }
        if (!col) return;

        const c = parseCsvLine(line);
        if (c[col.nature_mutation] !== 'Vente') continue;
        if (c[col.type_local] !== 'Maison') continue;
        const lat = asNumber(c[col.latitude]);
        const lng = asNumber(c[col.longitude]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        if (lat < bbox.minLat || lat > bbox.maxLat || lng < bbox.minLng || lng > bbox.maxLng) continue;

        const val = asNumber(c[col.valeur_fonciere]);
        const surf = asNumber(c[col.surface_reelle_bati]);
        if (!Number.isFinite(val) || !Number.isFinite(surf) || val <= 0 || surf <= 0) continue;
        if (surf < DEFAULTS.surfaceMin || surf > DEFAULTS.surfaceMax) continue;
        const p = val / surf;
        if (!Number.isFinite(p) || p < DEFAULTS.eurM2Min || p > DEFAULTS.eurM2Max) continue;

        const ix = Math.min(idxW - 1, Math.max(0, Math.floor((lng - minLng) / stepLng)));
        const iy = Math.min(DEFAULTS.gridNy - 1, Math.max(0, Math.floor((bbox.maxLat - lat) / stepLat)));
        const id = iy * idxW + ix;
        const cell = acc.get(id) || new CellAcc();
        cell.push(p);
        acc.set(id, cell);

        if (accT4 && col.nombre_pieces_principales != null) {
          const np = asNumber(c[col.nombre_pieces_principales]);
          if (Number.isFinite(np) && np >= DEFAULTS.minPiecesT4) {
            const cell4 = accT4.get(id) || new CellAcc();
            cell4.push(p);
            accT4.set(id, cell4);
          }
        }
      }
    });
    stream.on('end', () => {
      // eslint-disable-next-line no-console
      console.log('DVF heatmap: lines', lines, 'year', year);
      resolve();
    });
    stream.on('error', reject);
    gunzip.on('error', reject);
    res.on('error', reject);
  });

  await sleep(200);
}

async function main() {
  const z = readJson(ZONES);
  const o = (z && z.origin) ? z.origin : null;
  if (!o || !Number.isFinite(o.lat) || !Number.isFinite(o.lng)) {
    throw new Error('bordeaux-zones.json: missing origin lat/lng (run geocode first)');
  }

  const rKm = DEFAULTS.radiusKm;
  const dlat = degOffsetLat(rKm);
  const dlng = degOffsetLng(rKm, o.lat);

  const bbox = {
    minLat: o.lat - dlat,
    maxLat: o.lat + dlat,
    minLng: o.lng - dlng,
    maxLng: o.lng + dlng
  };

  const nx = DEFAULTS.gridNx;
  const ny = DEFAULTS.gridNy;
  const stepLat = (bbox.maxLat - bbox.minLat) / (ny);
  const stepLng = (bbox.maxLng - bbox.minLng) / (nx);
  if (!(stepLat > 0) || !(stepLng > 0)) throw new Error('Invalid grid steps');

  const acc = new Map();
  const accT4 = new Map();
  for (const y of YEARS) {
    // eslint-disable-next-line no-await-in-loop
    await scanYearToCells(y, bbox, stepLat, stepLng, bbox.minLat, bbox.minLng, nx, acc, accT4);
  }

  const eurM2 = new Array(nx * ny).fill(null);
  const counts = new Array(nx * ny).fill(0);
  for (const [id, cell] of acc) {
    const c = cell.count();
    if (c < DEFAULTS.minCellCount) {
      eurM2[Number(id)] = null;
      counts[Number(id)] = 0;
      continue;
    }
    const m = cell.median();
    eurM2[Number(id)] = m == null ? null : round2(m);
    counts[Number(id)] = c;
  }

  const okVals = eurM2.filter((v) => Number.isFinite(v));
  const p10 = q(okVals, 0.1);
  const p90 = q(okVals, 0.9);

  const eurM2T4p = new Array(nx * ny).fill(null);
  const countsT4p = new Array(nx * ny).fill(0);
  for (const [id, cell] of accT4) {
    const c = cell.count();
    if (c < DEFAULTS.minCellCountT4) {
      eurM2T4p[Number(id)] = null;
      countsT4p[Number(id)] = 0;
      continue;
    }
    const m = cell.median();
    eurM2T4p[Number(id)] = m == null ? null : round2(m);
    countsT4p[Number(id)] = c;
  }
  const okT4 = eurM2T4p.filter((v) => Number.isFinite(v));
  const p10T4 = q(okT4, 0.1);
  const p90T4 = q(okT4, 0.9);

  const out = {
    kind: 'bordeauxDvfHouseHeatmap',
    builtAt: new Date().toISOString(),
    origin: { label: o.label, lat: o.lat, lng: o.lng },
    bbox: bbox,
    grid: { nx, ny, units: { x: 'lng', y: 'lat' } },
    filters: {
      minCellCount: DEFAULTS.minCellCount,
      minCellCountT4: DEFAULTS.minCellCountT4,
      minPiecesT4: DEFAULTS.minPiecesT4,
      years: YEARS,
      department: DVF_DEPT,
      type_local: 'Maison',
      nature_mutation: 'Vente',
      surfaceMin: DEFAULTS.surfaceMin,
      surfaceMax: DEFAULTS.surfaceMax,
      eurM2Min: DEFAULTS.eurM2Min,
      eurM2Max: DEFAULTS.eurM2Max
    },
    summary: {
      nonEmptyCells: okVals.length,
      medianGlobal: q(okVals, 0.5) == null ? null : round2(q(okVals, 0.5)),
      p10: p10 == null ? null : round2(p10),
      p90: p90 == null ? null : round2(p90)
    },
    eurM2: eurM2,
    counts: counts,
    summaryT4p: {
      nonEmptyCells: okT4.length,
      medianGlobal: q(okT4, 0.5) == null ? null : round2(q(okT4, 0.5)),
      p10: p10T4 == null ? null : round2(p10T4),
      p90: p90T4 == null ? null : round2(p90T4)
    },
    eurM2T4p: eurM2T4p,
    countsT4p: countsT4p
  };

  writeJson(OUT, out);
  // eslint-disable-next-line no-console
  console.log('Wrote', OUT, 'cells', okVals.length, '/', eurM2.length);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

