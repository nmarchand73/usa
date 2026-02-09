/**
 * merge-json.js
 * Merges state-map, city-coordinates, venues-map, airports, and livability-details
 * into a single app-data.json for the frontend. Optionally includes tracks-by-state.json.
 *
 * Run after updating any source JSON: node scripts/merge-json.js
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const MAP_DATA = path.join(BASE, 'map-data');
const PUBLIC = path.join(BASE, 'public');
const FILES = {
  stateMap: path.join(MAP_DATA, 'state-map.json'),
  cityCoordinates: path.join(MAP_DATA, 'city-coordinates.json'),
  venues: path.join(MAP_DATA, 'venues-map.json'),
  airports: path.join(MAP_DATA, 'airports.json'),
  livabilityDetails: path.join(MAP_DATA, 'livability-details.json'),
  tracksByState: path.join(MAP_DATA, 'tracks-by-state.json')
};
const OUT_FILE = path.join(PUBLIC, 'app-data.json');

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Warning: could not read ' + path.basename(filePath) + ':', e.message);
    return fallback !== undefined ? fallback : {};
  }
}

const stateMap = readJson(FILES.stateMap, {});
const cityCoordinates = readJson(FILES.cityCoordinates, {});
const venues = readJson(FILES.venues, {});
const airports = readJson(FILES.airports, []);
const livabilityDetails = readJson(FILES.livabilityDetails, {});

const appData = {
  stateMap,
  cityCoordinates,
  venues,
  airports: Array.isArray(airports) ? airports : [],
  livabilityDetails
};

if (fs.existsSync(FILES.tracksByState)) {
  appData.tracksByState = readJson(FILES.tracksByState, {});
}

fs.writeFileSync(OUT_FILE, JSON.stringify(appData, null, 2), 'utf-8');
console.log('Written: ' + OUT_FILE);
