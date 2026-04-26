/**
 * Télécharge les fiches circuits MXC40 (depuis les pages “liste par département”)
 * et en extrait les coordonnées (liens Google Maps / Waze).
 *
 * Sortie : map-data/mxc40-mx-circuits.json
 * Puis : npm run build:fr (merge-json-fr.js) pour fusionner dans public/app-data-fr.json
 *
 * Usage: node scripts/fetch-mxc40-mx-circuits.js
 *
 * Listes de départ couvertes ici (Bordeaux ≈ 33, Lyon ≈ 69) :
 * - https://www.mxc40.com/les-circuits-de-motocross-en-gironde/
 * - https://www.mxc40.com/les-circuits-de-motocross-dans-le-rhone/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.resolve(__dirname, '..');
const OUT = path.join(BASE, 'map-data', 'mxc40-mx-circuits.json');

const LIST_URLS = [
  {
    url: 'https://www.mxc40.com/les-circuits-de-motocross-en-gironde/',
    dept: '33',
    deptName: 'Gironde'
  },
  {
    url: 'https://www.mxc40.com/les-circuits-de-motocross-dans-le-rhone/',
    dept: '69',
    deptName: 'Rhône'
  }
];

const USER_AGENT = 'usa-interactive-map/2.0 (MXC40 fetch; +https://github.com/nmarchand73/usa)';
const DELAY_MS = 850;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.get(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          resolve(data);
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(40000, () => req.destroy(new Error('timeout')));
  });
}

function collectCircuitLinks(html) {
  const re = /href="(https:\/\/www\.mxc40\.com\/le-circuit-de-motocross[^"]+)"/g;
  const out = new Set();
  let m;
  while ((m = re.exec(html)) !== null) {
    const u = m[1].replace(/&amp;/g, '&');
    if (!/\/le-circuit-de-motocross-[^/]+\/?$/.test(u)) continue;
    out.add(u.replace(/\/$/, ''));
  }
  return Array.from(out);
}

function parseLatLng(html) {
  const g = html.match(/maps\.google\.com\/maps\/search\/\?[^"'>\s]*query=([-\d.]+),([-\d.]+)/i);
  if (g) {
    return { lat: Number(g[1]), lng: Number(g[2]) };
  }
  const w = html.match(/waze\.com\/ul\?[^"'>\s]*\bll=([-\d.]+),([-\d.]+)/i);
  if (w) {
    return { lat: Number(w[1]), lng: Number(w[2]) };
  }
  return null;
}

function parseTitleName(html) {
  const t = html.match(/<title>([^<]+)<\/title>/i);
  if (t) {
    const s = t[1].replace(/\s*-\s*MXC40\s*$/i, '').trim();
    if (s) return s;
  }
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].trim();
  return null;
}

function parseMotoClub(html) {
  // Tableau: ligne "Moto-Club" cellule nom (approx.)
  const m = html.match(/Moto-Club<\/(strong|td|th|b)>\s*<\/(td|th)>\s*<td[^>]*>([^<]+)</i);
  if (m) return m[3].trim() || null;
  return null;
}

async function fetchCircuit(url, listMeta) {
  const html = await fetchText(url);
  const ll = parseLatLng(html);
  const name = parseTitleName(html) || 'Circuit motocross';
  const motoClub = parseMotoClub(html);
  if (!ll || !Number.isFinite(ll.lat) || !Number.isFinite(ll.lng)) {
    return { url, name, dept: listMeta.dept, error: 'no_lat_lng' };
  }
  return {
    name,
    city: listMeta.deptName + ' (' + listMeta.dept + ')',
    lat: ll.lat,
    lng: ll.lng,
    type: 'mx_track',
    venueKind: 'mx_track',
    url,
    source: 'MXC40',
    mxc40Dept: listMeta.dept,
    mxc40DeptName: listMeta.deptName,
    operator: motoClub
  };
}

async function main() {
  const all = [];
  const byUrl = new Set();

  for (const list of LIST_URLS) {
    // eslint-disable-next-line no-console
    console.log('List:', list.url);
    const h = await fetchText(list.url);
    const links = collectCircuitLinks(h);
    // eslint-disable-next-line no-console
    console.log('  circuits (links):', links.length);

    for (const u of links) {
      if (byUrl.has(u)) continue;
      byUrl.add(u);
      await sleep(DELAY_MS);
      // eslint-disable-next-line no-console
      console.log('  →', u);
      const item = await fetchCircuit(u, list);
      if (item.error) {
        // eslint-disable-next-line no-console
        console.warn('    skip:', item.error, item.name);
        continue;
      }
      all.push(item);
    }
  }

  const out = {
    kind: 'mxc40MotocrossCircuits',
    fetchedAt: new Date().toISOString(),
    listUrls: LIST_URLS,
    count: all.length,
    mxTracks: all
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  // eslint-disable-next-line no-console
  console.log('Wrote', OUT, '—', all.length, 'circuits with coords');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
