/**
 * merge-json-fr.js
 * Build France bundle (13 régions métropolitaines) into public/app-data-fr.json
 *
 * This is intentionally separate from the USA bundle to keep schemas evolvable
 * for later: departments (ADM2) and other countries.
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const MAP_DATA = path.join(BASE, 'map-data');
const PUBLIC = path.join(BASE, 'public');

const FILES = {
  regionMap: path.join(MAP_DATA, 'region-map.json'),
  cityCoordinates: path.join(MAP_DATA, 'city-coordinates-fr.json'),
  venues: path.join(MAP_DATA, 'venues-map-fr.json'),
  /** Motocross FR : node scripts/fetch-fr-mx-only.js (prioritaire sur venues-map-fr.mxTracks si présent) */
  mxOverpass: path.join(MAP_DATA, 'mx-fr-overpass.json'),
  /** Géocodage Nominatim depuis scripts/geocode-mtb-downhill-curated-fr.js */
  mtbDownhillCurated: path.join(MAP_DATA, 'mtb-downhill-fr-curated.json'),
  /** Données officielles réseau : scripts/fetch-yellohvillage-official-fr.js */
  yellohOfficial: path.join(MAP_DATA, 'yellohvillage-official-fr.json'),
  /** Liste France : scripts/fetch-sandaya-fr.js (page nos-campings, hors étranger) */
  sandayaFr: path.join(MAP_DATA, 'sandaya-fr.json'),
  /** Circuits TT FFM : scripts/fetch-ffm-circuits-tt-fr.js (par ligue, ex. NA 62995) */
  ffmCircuitsTt: path.join(MAP_DATA, 'ffm-circuits-tt-nouvelle-aquitaine.json')
};

const OUT_FILE = path.join(PUBLIC, 'app-data-fr.json');

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Warning: could not read ' + path.basename(filePath) + ':', e.message);
    return fallback !== undefined ? fallback : {};
  }
}

const regionMap = readJson(FILES.regionMap, {});
const cityCoordinates = readJson(FILES.cityCoordinates, {});
const venues = readJson(FILES.venues, {});
const mxOverlay = readJson(FILES.mxOverpass, null);
const mxFromOverlay = mxOverlay && Array.isArray(mxOverlay.mxTracks) ? mxOverlay.mxTracks : [];
if (mxFromOverlay.length) {
  venues.mxTracks = mxFromOverlay;
} else if (!Array.isArray(venues.mxTracks)) {
  venues.mxTracks = [];
}
const mtbCuratedRaw = readJson(FILES.mtbDownhillCurated, null);
const mtbDownCurated = Array.isArray(mtbCuratedRaw) ? mtbCuratedRaw : [];
if (mtbDownCurated.length) {
  venues.mtbDownhillCurated = mtbDownCurated;
}

const yellohOfficialFile = readJson(FILES.yellohOfficial, null);
const yellohFromOfficial = yellohOfficialFile && Array.isArray(yellohOfficialFile.campings)
  ? yellohOfficialFile.campings
  : [];
if (yellohFromOfficial.length) {
  venues.yellohVillageCampings = yellohFromOfficial;
}

const sandayaFile = readJson(FILES.sandayaFr, null);
const sandayaCampings = sandayaFile && Array.isArray(sandayaFile.campings) ? sandayaFile.campings : [];
if (sandayaCampings.length) {
  venues.sandayaCampings = sandayaCampings;
}

const ffmFile = readJson(FILES.ffmCircuitsTt, null);
const ffmRaw = ffmFile && Array.isArray(ffmFile.circuits) ? ffmFile.circuits : [];
const ffmTtCircuits = [];
for (const c of ffmRaw) {
  const lat = c.lat != null ? Number(c.lat) : NaN;
  const lng = c.lng != null ? Number(c.lng) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  ffmTtCircuits.push({
    name: c.name || c.slug || 'Circuit TT',
    city: c.cityLine || null,
    lat,
    lng,
    type: 'mx_track',
    venueKind: 'mx_track',
    url: c.url || null,
    source: 'FFM Engage',
    circuitType: c.circuitType || null,
    ffmLigueId: ffmFile.ligueId != null ? String(ffmFile.ligueId) : null,
    ffmLigueLabel: ffmFile.ligueLabel || null
  });
}
if (ffmTtCircuits.length) {
  venues.ffmTtCircuits = ffmTtCircuits;
}

const appData = {
  manifest: {
    countryCode: 'FR',
    adminLevel: 'ADM1',
    adminLabelFr: 'Régions',
    adminLabelEn: 'Regions',
    defaultLocale: 'fr',
    currency: 'EUR',
    keys: {
      territoryKey: '{countryCode}-{adminCode}',
      cityKey: '{adminCode}|{cityName}',
      notes: [
        'France V1 (ADM1) uses INSEE region codes as adminCode (e.g., 11, 84).',
        'City coordinates keys are built as \"{adminCode}|{CityName}\" matching topCities[].name.',
        'For future ADM2 (departments), prefer explicit territory keys like FR-69 to avoid collisions with region codes.'
      ]
    },
    geo: {
      regionsGeoJson: 'geo/regions-fr.geojson'
    }
  },
  regionMap,
  cityCoordinates,
  venues,
  airports: [],
  livabilityDetails: {}
};

fs.writeFileSync(OUT_FILE, JSON.stringify(appData, null, 2), 'utf-8');
console.log('Written: ' + OUT_FILE);

