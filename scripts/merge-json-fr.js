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
  venues: path.join(MAP_DATA, 'venues-map-fr.json')
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

