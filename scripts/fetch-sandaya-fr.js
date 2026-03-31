/**
 * Campings Sandaya en France — extraction depuis la page liste publique
 * (https://www.sandaya.fr/nos-campings), balises data-latitude / data-longitude
 * et cartes HTML (ville, région, étoiles).
 *
 * Les campings hors France (ex. Catalogne, Toscane, Wallonie, Valence) sont exclus
 * via une liste de sous-chaînes sur le libellé « région ».
 *
 * Sortie : map-data/sandaya-fr.json → merge-json-fr.js → venues.sandayaCampings
 *
 * Usage : node scripts/fetch-sandaya-fr.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const OUT = path.join(BASE, 'map-data', 'sandaya-fr.json');
const LIST_URL = 'https://www.sandaya.fr/nos-campings';

/** Régions / zones listées qui ne sont pas en France métropolitaine + Corse. */
const EXCLUDE_REGION_SUBSTR = [
  'catalogne',
  'toscane',
  'toscan',
  'venetie',
  'vénétie',
  'wallonie',
  'valencienne',
  'communauté valencienne',
  'veneto',
  'toscana',
  'catalunya',
  'belgique',
  'italie',
  'espagne',
  'spagna'
];

function normalizeForMatch(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isFranceRegionLabel(regionText) {
  const t = normalizeForMatch(regionText);
  if (!t) return true;
  for (const ex of EXCLUDE_REGION_SUBSTR) {
    if (t.includes(normalizeForMatch(ex))) return false;
  }
  return true;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; usa-map/2.0; +https://github.com)' } }, (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve(raw);
          else reject(new Error(`HTTP ${res.statusCode}`));
        });
      })
      .on('error', reject)
      .setTimeout(60000, function onTimeout() {
        this.destroy(new Error('timeout'));
      });
  });
}

function parseCampingsFromHtml(html) {
  const chunks = html.split(/(?=<div id="camping-\d+")/);
  const out = [];
  const seen = new Set();

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];

    const idm = chunk.match(/id="camping-(\d+)"/);
    const remoteId = idm ? idm[1] : null;

    const latm = chunk.match(/data-latitude="([^"]+)"/);
    const lngm = chunk.match(/data-longitude="([^"]+)"/);
    const lat = latm ? Number(latm[1]) : NaN;
    const lng = lngm ? Number(lngm[1]) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const cidm = chunk.match(/data-camping-id="([^"]+)"/);
    const rental = chunk.match(/data-url-rental="([^"]+)"/);
    const hrefm = chunk.match(/<a class="name[^"]*"\s+href="([^"]+)"/);
    const namem = chunk.match(/<a class="name[^"]*"[^>]*>([^<]+)<\/a>/);

    const citym = chunk.match(/<span class="city">\s*([^<]+?)\s*<\/span>/);
    const regm = chunk.match(/<span class="region">\s*([^<]+?)\s*<\/span>/);
    const openm = chunk.match(/data-open-date="'([^']*)'"/);
    const closem = chunk.match(/data-close-date="'([^']*)'"/);
    const starm = chunk.match(/sandaya-pictos-star-(\d)/);

    const city = citym ? citym[1].trim() : null;
    const region = regm ? regm[1].trim() : null;
    if (!isFranceRegionLabel(region)) continue;

    const name = namem ? namem[1].trim() : (remoteId ? 'Camping ' + remoteId : 'Sandaya');
    const slugHref = hrefm ? hrefm[1].trim() : null;
    const pathCamp = slugHref && slugHref.startsWith('/') ? slugHref : rental && String(rental[1]).replace(/\/nos-locations$/, '') ? String(rental[1]).replace(/\/nos-locations$/, '') : null;
    const url = pathCamp
      ? `https://www.sandaya.fr${pathCamp.startsWith('/') ? pathCamp : '/' + pathCamp}`
      : 'https://www.sandaya.fr/nos-campings';

    const starCount = starm ? Number(starm[1]) : null;
    const openRaw = openm && openm[1] ? openm[1].trim() : null;
    const closeRaw = closem && closem[1] ? closem[1].trim() : null;
    let openingSeason = null;
    if (openRaw && closeRaw) openingSeason = `${openRaw} – ${closeRaw}`;
    else if (openRaw) openingSeason = `à partir du ${openRaw}`;

    const sandayaCampingId = cidm ? String(cidm[1]).trim() : null;
    const key = sandayaCampingId || `${lat.toFixed(5)},${lng.toFixed(5)},${name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      name,
      city,
      department: region,
      lat,
      lng,
      venueKind: 'sandaya_camping',
      brand: 'Sandaya',
      source: 'Sandaya listing HTML',
      url,
      starCount: Number.isFinite(starCount) && starCount > 0 ? starCount : null,
      openingSeason,
      sandayaCampingId,
      sandayaRemoteId: remoteId
    });
  }

  return out;
}

(async function main() {
  const html = await httpsGet(LIST_URL);
  const campings = parseCampingsFromHtml(html);
  campings.sort((a, b) => String(a.name).localeCompare(String(b.name), 'fr'));

  const payload = {
    _meta: {
      fetchedAt: new Date().toISOString(),
      sourceUrl: LIST_URL,
      totalFrance: campings.length,
      note: 'Coordonnées et métadonnées parsées depuis la page liste publique Sandaya (hors DOM étranger via libellé région). Pas de note satisfaction dans cette source.'
    },
    campings
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf-8');
  console.log('Written:', OUT);
  console.log('Campings France:', campings.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
