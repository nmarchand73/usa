/**
 * Compute nearest international airport for each _livabilityCities entry.
 *
 * For each city:
 *   1. Look up coordinates from city-coordinates.json
 *   2. Fallback: _bestCities (lat/lng)
 *   3. Fallback: free Nominatim geocoding (1 req/sec)
 *   4. Compute Haversine distance to ~60 US international airports
 *   5. Store nearestAirport { code, name, distanceKm } in state-map.json
 *
 * Usage:
 *   node scripts/compute-airport-distances.js
 *   node scripts/compute-airport-distances.js --test "TX|Flower Mound"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const stateMapPath = path.join(__dirname, '..', 'state-map.json');
const cityCoordsPath = path.join(__dirname, '..', 'city-coordinates.json');

const stateMap = JSON.parse(fs.readFileSync(stateMapPath, 'utf8'));
const cityCoords = JSON.parse(fs.readFileSync(cityCoordsPath, 'utf8'));

// CLI args
var TEST_KEY = null;
var testIdx = process.argv.indexOf('--test');
if (testIdx >= 0 && process.argv[testIdx + 1]) {
  TEST_KEY = process.argv[testIdx + 1];
}

// ── Major US international airports (IATA, name, lat, lng) ──
const AIRPORTS = [
  { code: 'ATL', name: 'Atlanta Hartsfield-Jackson', lat: 33.6407, lng: -84.4277 },
  { code: 'DFW', name: 'Dallas/Fort Worth', lat: 32.8998, lng: -97.0403 },
  { code: 'DEN', name: 'Denver', lat: 39.8561, lng: -104.6737 },
  { code: 'ORD', name: "Chicago O'Hare", lat: 41.9742, lng: -87.9073 },
  { code: 'LAX', name: 'Los Angeles', lat: 33.9425, lng: -118.4081 },
  { code: 'JFK', name: 'New York JFK', lat: 40.6413, lng: -73.7781 },
  { code: 'EWR', name: 'Newark Liberty', lat: 40.6895, lng: -74.1745 },
  { code: 'SFO', name: 'San Francisco', lat: 37.6213, lng: -122.3790 },
  { code: 'SEA', name: 'Seattle-Tacoma', lat: 47.4502, lng: -122.3088 },
  { code: 'MIA', name: 'Miami', lat: 25.7959, lng: -80.2870 },
  { code: 'MCO', name: 'Orlando', lat: 28.4312, lng: -81.3081 },
  { code: 'IAH', name: 'Houston George Bush', lat: 29.9902, lng: -95.3368 },
  { code: 'BOS', name: 'Boston Logan', lat: 42.3656, lng: -71.0096 },
  { code: 'MSP', name: 'Minneapolis-Saint Paul', lat: 44.8848, lng: -93.2223 },
  { code: 'DTW', name: 'Detroit Metro', lat: 42.2124, lng: -83.3534 },
  { code: 'PHL', name: 'Philadelphia', lat: 39.8744, lng: -75.2424 },
  { code: 'CLT', name: 'Charlotte Douglas', lat: 35.2140, lng: -80.9431 },
  { code: 'LAS', name: 'Las Vegas Harry Reid', lat: 36.0840, lng: -115.1537 },
  { code: 'PHX', name: 'Phoenix Sky Harbor', lat: 33.4373, lng: -112.0078 },
  { code: 'IAD', name: 'Washington Dulles', lat: 38.9531, lng: -77.4565 },
  { code: 'DCA', name: 'Washington Reagan', lat: 38.8512, lng: -77.0402 },
  { code: 'BWI', name: 'Baltimore-Washington', lat: 39.1774, lng: -76.6684 },
  { code: 'SLC', name: 'Salt Lake City', lat: 40.7899, lng: -111.9791 },
  { code: 'SAN', name: 'San Diego', lat: 32.7338, lng: -117.1933 },
  { code: 'TPA', name: 'Tampa', lat: 27.9756, lng: -82.5333 },
  { code: 'PDX', name: 'Portland (OR)', lat: 45.5898, lng: -122.5951 },
  { code: 'STL', name: 'Saint Louis Lambert', lat: 38.7487, lng: -90.3700 },
  { code: 'BNA', name: 'Nashville', lat: 36.1263, lng: -86.6774 },
  { code: 'AUS', name: 'Austin-Bergstrom', lat: 30.1975, lng: -97.6664 },
  { code: 'SAT', name: 'San Antonio', lat: 29.5337, lng: -98.4698 },
  { code: 'RDU', name: 'Raleigh-Durham', lat: 35.8801, lng: -78.7880 },
  { code: 'MCI', name: 'Kansas City', lat: 39.2976, lng: -94.7139 },
  { code: 'IND', name: 'Indianapolis', lat: 39.7173, lng: -86.2944 },
  { code: 'CMH', name: 'Columbus (OH)', lat: 39.9980, lng: -82.8919 },
  { code: 'PIT', name: 'Pittsburgh', lat: 40.4919, lng: -80.2329 },
  { code: 'CLE', name: 'Cleveland Hopkins', lat: 41.4058, lng: -81.8540 },
  { code: 'CVG', name: 'Cincinnati/Northern Kentucky', lat: 39.0489, lng: -84.6678 },
  { code: 'JAX', name: 'Jacksonville', lat: 30.4941, lng: -81.6879 },
  { code: 'RIC', name: 'Richmond', lat: 37.5052, lng: -77.3197 },
  { code: 'ORF', name: 'Norfolk', lat: 36.8946, lng: -76.2012 },
  { code: 'MEM', name: 'Memphis', lat: 35.0424, lng: -89.9767 },
  { code: 'OKC', name: 'Oklahoma City Will Rogers', lat: 35.3931, lng: -97.6007 },
  { code: 'TUL', name: 'Tulsa', lat: 36.1984, lng: -95.8881 },
  { code: 'ABQ', name: 'Albuquerque Sunport', lat: 35.0402, lng: -106.6091 },
  { code: 'OMA', name: 'Omaha Eppley', lat: 41.3032, lng: -95.8941 },
  { code: 'MKE', name: 'Milwaukee Mitchell', lat: 42.9472, lng: -87.8966 },
  { code: 'BOI', name: 'Boise', lat: 43.5644, lng: -116.2228 },
  { code: 'BDL', name: 'Hartford Bradley', lat: 41.9389, lng: -72.6832 },
  { code: 'BUF', name: 'Buffalo Niagara', lat: 42.9405, lng: -78.7322 },
  { code: 'ANC', name: 'Anchorage Ted Stevens', lat: 61.1743, lng: -149.9962 },
  { code: 'HNL', name: 'Honolulu Daniel K. Inouye', lat: 21.3187, lng: -157.9224 },
  { code: 'MSY', name: 'New Orleans Louis Armstrong', lat: 29.9934, lng: -90.2580 },
  { code: 'BHM', name: 'Birmingham-Shuttlesworth', lat: 33.5629, lng: -86.7535 },
  { code: 'GSP', name: 'Greenville-Spartanburg', lat: 34.8957, lng: -82.2189 },
  { code: 'LIT', name: 'Little Rock Clinton', lat: 34.7294, lng: -92.2243 },
  { code: 'FAR', name: 'Fargo Hector', lat: 46.9207, lng: -96.8158 },
  { code: 'FSD', name: 'Sioux Falls', lat: 43.5820, lng: -96.7419 },
  { code: 'BIL', name: 'Billings Logan', lat: 45.8077, lng: -108.5430 },
  { code: 'DSM', name: 'Des Moines', lat: 41.5340, lng: -93.6631 },
  { code: 'GRR', name: 'Grand Rapids Gerald R. Ford', lat: 42.8808, lng: -85.5228 },
  { code: 'PWM', name: 'Portland (ME) Jetport', lat: 43.6462, lng: -70.3093 },
  { code: 'CHS', name: 'Charleston (SC)', lat: 32.8986, lng: -80.0405 },
  { code: 'SAV', name: 'Savannah/Hilton Head', lat: 32.1276, lng: -81.2021 },
  { code: 'AVL', name: 'Asheville Regional', lat: 35.4362, lng: -82.5418 },
  { code: 'ICT', name: 'Wichita Eisenhower', lat: 37.6499, lng: -97.4331 },
  { code: 'MHT', name: 'Manchester-Boston Regional', lat: 42.9326, lng: -71.4357 },
];

// ── Haversine distance (km) ──
function haversineKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestAirport(lat, lng) {
  var best = null;
  var bestDist = Infinity;
  AIRPORTS.forEach(function (ap) {
    var d = haversineKm(lat, lng, ap.lat, ap.lng);
    if (d < bestDist) {
      bestDist = d;
      best = ap;
    }
  });
  return { code: best.code, name: best.name, distanceKm: Math.round(bestDist) };
}

// ── Nominatim geocoding fallback ──
function geocodeNominatim(cityName, stateCode) {
  return new Promise(function (resolve, reject) {
    var query = encodeURIComponent(cityName + ', ' + stateCode + ', United States');
    var url = 'https://nominatim.openstreetmap.org/search?q=' + query + '&format=json&limit=1&countrycodes=us';
    https.get(url, {
      headers: { 'User-Agent': 'CityAirportBot/1.0 (educational project)' }
    }, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        try {
          var data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if (data && data.length > 0) {
            resolve([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            resolve(null);
          }
        } catch (e) { resolve(null); }
      });
      res.on('error', function () { resolve(null); });
    }).on('error', function () { resolve(null); });
  });
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// ── Coordinate lookup (3 sources) ──
async function getCityCoords(cityName, stateCode) {
  // 1. city-coordinates.json
  var key = stateCode + '|' + cityName;
  if (cityCoords[key]) {
    return cityCoords[key]; // [lat, lng]
  }
  // 2. _bestCities
  if (stateMap._bestCities) {
    var bc = stateMap._bestCities.find(function (c) {
      return c.name === cityName && c.stateCode === stateCode;
    });
    if (bc && bc.lat != null && bc.lng != null) {
      return [bc.lat, bc.lng];
    }
  }
  // 3. Nominatim geocoding
  console.log('    → Geocoding via Nominatim: ' + cityName + ', ' + stateCode);
  var result = await geocodeNominatim(cityName, stateCode);
  if (result) {
    console.log('    → Found: ' + result[0].toFixed(4) + ', ' + result[1].toFixed(4));
  } else {
    console.log('    → NOT FOUND');
  }
  await sleep(1100); // Nominatim rate limit: 1 req/sec
  return result;
}

async function main() {
  var livCities = stateMap._livabilityCities || [];
  if (!livCities.length) {
    console.error('No _livabilityCities found in state-map.json');
    process.exit(1);
  }

  // Filter for test mode
  if (TEST_KEY) {
    var parts = TEST_KEY.split('|');
    livCities = livCities.filter(function (c) {
      return c.state === parts[0] && c.name === parts[1];
    });
    console.log('TEST MODE: ' + TEST_KEY + ' (' + livCities.length + ' match)\n');
  }

  console.log('=== Computing nearest airport for ' + livCities.length + ' cities ===\n');

  var success = 0;
  var failed = 0;

  for (var i = 0; i < livCities.length; i++) {
    var city = livCities[i];
    process.stdout.write('[' + (i + 1) + '/' + livCities.length + '] ' + city.name + ', ' + city.state + ' ... ');

    var coords = await getCityCoords(city.name, city.state);
    if (!coords) {
      console.log('NO COORDS');
      failed++;
      continue;
    }

    var nearest = findNearestAirport(coords[0], coords[1]);
    city.nearestAirport = nearest;
    success++;
    console.log(nearest.code + ' · ' + nearest.distanceKm + ' km (' + nearest.name + ')');
  }

  console.log('\n=== Done: ' + success + ' OK, ' + failed + ' failed ===\n');

  // Save
  fs.writeFileSync(stateMapPath, JSON.stringify(stateMap, null, 2), 'utf8');
  console.log('Saved to state-map.json');
}

main().catch(function (err) { console.error(err); process.exit(1); });
