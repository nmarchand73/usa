/**
 * Récupère les campings Yelloh! Village (France) via l’API GraphQL utilisée par le site
 * (https://api.sitepriv.prod.yellohvillage.fr/graphql — en-têtes gql-* comme le front).
 *
 * Sortie : map-data/yellohvillage-official-fr.json (tableau). merge-json-fr.js la fusionne
 * dans app-data-fr.json en priorité sur les points OSM.
 *
 * Usage : node scripts/fetch-yellohvillage-official-fr.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE = path.join(__dirname, '..');
const OUT = path.join(BASE, 'map-data', 'yellohvillage-official-fr.json');

const QUERY = `query MapCampings($peopleCount: Int!, $accommodationType: String!, $startDate: Date, $endDate: Date) {
  searchCampings(
    peopleCount: $peopleCount
    accommodationType: $accommodationType
    startDate: $startDate
    endDate: $endDate
  ) {
    campings {
      campingCode
      contentId
      countryId
      name
      city
      department
      campingUrl
      starCount
      note
      image
      isNew
      spotlighted
      isResidence
      availabilityStatus
      accommodationFilters
      openingDates {
        start
        end
      }
      coordinates {
        latitude
        longitude
      }
      filterCategories {
        categoryId
        type
        priority
        filters {
          id
          title
          key
          count
          priority
        }
      }
    }
  }
}`;

/** Métadonnée « pays » côté API pour la France (observé sur les départements français). */
const FRANCE_COUNTRY_ID = 434;

/** Libellés FR pour les catégories d’équipements (GraphQL filterCategories.categoryId). */
const AMENITY_CATEGORY_LABELS = {
  swimming: 'Espace aquatique & piscines',
  facilities: 'Équipements & services',
  children_clubs: 'Clubs enfants & ados',
  sports_activities: 'Animations & soirées',
  sports_activities_on_site: 'Sports & activités sur place'
};

function isoToFrDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function openingSeasonFr(openingDates) {
  if (!Array.isArray(openingDates) || openingDates.length === 0) return null;
  const w = openingDates[0];
  const a = isoToFrDate(w && w.start);
  const b = isoToFrDate(w && w.end);
  if (a && b) return `${a} – ${b}`;
  if (a) return `à partir du ${a}`;
  return null;
}

/** Regroupe les filtres par catégorie (liste de libellés, limitée). */
function amenitiesByCategory(filterCategories, maxPerCategory) {
  const cap = Math.max(1, maxPerCategory || 12);
  const out = {};
  for (const block of filterCategories || []) {
    const id = block && block.categoryId;
    if (!id) continue;
    const titles = (block.filters || [])
      .map((f) => (f && (f.title || f.key)) || '')
      .map((s) => String(s).trim())
      .filter(Boolean);
    const label = AMENITY_CATEGORY_LABELS[id] || id;
    if (!out[id]) out[id] = { label, items: [] };
    for (const t of titles) {
      if (out[id].items.length >= cap) break;
      if (!out[id].items.includes(t)) out[id].items.push(t);
    }
  }
  return out;
}

function httpsPostJson(hostname, pathName, bodyObj, headers) {
  const body = JSON.stringify(bodyObj);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path: pathName,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Content-Length': Buffer.byteLength(body, 'utf8'),
          'User-Agent':
            'usa-interactive-map/2.0 (Yelloh FR listing; same headers as public site widgets)'
        }
      },
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
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 400)}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(60000, () => req.destroy(new Error('timeout')));
    req.write(body);
    req.end();
  });
}

function normalizeItem(c) {
  const lat = c.coordinates && Number(c.coordinates.latitude);
  const lng = c.coordinates && Number(c.coordinates.longitude);
  const pathCamp = (c.campingUrl && String(c.campingUrl).trim()) || '';
  const url =
    pathCamp && pathCamp.startsWith('http')
      ? pathCamp
      : `https://www.yellohvillage.fr${pathCamp.startsWith('/') ? '' : '/'}${pathCamp}`;
  const city = c.city != null ? String(c.city).trim() : null;
  const starCount = c.starCount != null ? Number(c.starCount) : null;
  const note = c.note != null && String(c.note).trim() ? String(c.note).trim() : null;
  const image =
    c.image != null && String(c.image).trim() ? String(c.image).trim() : null;
  const af = Array.isArray(c.accommodationFilters) ? c.accommodationFilters.map(String).filter(Boolean) : [];
  const accommodationTypeCodes = af.slice(0, 24);

  return {
    name: c.name ? String(c.name).trim() : 'Yelloh! Village',
    city: city || null,
    department: c.department != null ? String(c.department).trim() : null,
    lat,
    lng,
    venueKind: 'yelloh_village',
    brand: 'Yelloh! Village',
    source: 'Yelloh! GraphQL',
    campingCode: c.campingCode,
    contentId: c.contentId,
    countryId: c.countryId,
    url,
    starCount: Number.isFinite(starCount) && starCount > 0 ? starCount : null,
    note,
    image,
    isNew: !!c.isNew,
    spotlighted: !!c.spotlighted,
    isResidence: !!c.isResidence,
    availabilityStatus:
      c.availabilityStatus != null && String(c.availabilityStatus).trim()
        ? String(c.availabilityStatus).trim()
        : null,
    openingSeason: openingSeasonFr(c.openingDates),
    amenitiesByCategory: amenitiesByCategory(c.filterCategories, 14),
    accommodationTypeCodes: accommodationTypeCodes.length ? accommodationTypeCodes : null
  };
}

async function main() {
  const host = 'api.sitepriv.prod.yellohvillage.fr';
  const headers = {
    Origin: 'https://www.yellohvillage.fr',
    Referer: 'https://www.yellohvillage.fr/',
    'gql-origin': 'https://www.yellohvillage.fr',
    'gql-market-site': '1',
    'gql-locale': 'fr'
  };

  const j = await httpsPostJson(
    host,
    '/graphql',
    {
      query: QUERY,
      variables: {
        peopleCount: 2,
        accommodationType: 'rental',
        startDate: null,
        endDate: null
      }
    },
    headers
  );

  if (j.errors && j.errors.length) {
    throw new Error(j.errors.map((e) => e.message).join('; '));
  }

  const rawList = j.data && j.data.searchCampings && j.data.searchCampings.campings;
  if (!Array.isArray(rawList)) throw new Error('Réponse GraphQL inattendue (pas campings[])');

  const fr = rawList.filter((c) => Number(c.countryId) === FRANCE_COUNTRY_ID);
  const out = [];
  const seen = new Set();
  for (const c of fr) {
    const o = normalizeItem(c);
    if (!Number.isFinite(o.lat) || !Number.isFinite(o.lng)) continue;
    const k = o.campingCode || `${o.lat},${o.lng}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(o);
  }

  out.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));

  const meta = {
    fetchedAt: new Date().toISOString(),
    source: 'https://api.sitepriv.prod.yellohvillage.fr/graphql (searchCampings)',
    franceCountryId: FRANCE_COUNTRY_ID,
    totalFrance: out.length,
    totalAllCountries: rawList.length,
    note:
      'Champs non exposés sur CampingCard (liste) : nombre d’emplacements camping, tentes, mobil-homes séparés — codes locatifs dans accommodationTypeCodes.'
  };

  fs.writeFileSync(
    OUT,
    JSON.stringify({ _meta: meta, campings: out }, null, 2) + '\n',
    'utf8'
  );
  console.log('Written:', OUT);
  console.log('Campings France:', out.length, '| tous pays (brut):', rawList.length);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
