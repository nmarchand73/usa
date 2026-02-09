/**
 * Scrape Livability.com Quick Facts + Weather for all cities in city-coordinates.json,
 * _bestCities, and _livabilityCities in state-map.json.
 * 
 * For each city, fetches https://livability.com/{state}/{city-slug}/
 * and extracts:
 *   Quick Facts: Median Home Value, Median Household Income, Median Monthly Rent,
 *                Total Population, Average Commute, Median Property Tax
 *   Weather:     Average Temperatures (high/low), Annual Rainfall, Annual Snowfall
 * 
 * Each HTML page is saved to html-pages/{STATE}-{slug}.html for later use.
 *
 * Results are stored in state-map.json:
 *   - Each topCities entry gets a "livability" object
 *   - Each _bestCities entry gets a "livability" object
 *   - Each _livabilityCities entry gets a "livability" object + population
 *
 * Usage:
 *   node scripts/scrape-livability-cities.js              # scrape all (skip existing HTML)
 *   node scripts/scrape-livability-cities.js --force       # re-scrape even if HTML exists
 *   node scripts/scrape-livability-cities.js --test "TX|Flower Mound"  # test single city
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const cityCoordsPath = path.join(__dirname, '..', 'city-coordinates.json');
const stateMapPath = path.join(__dirname, '..', 'state-map.json');
const htmlPagesDir = path.join(__dirname, '..', 'html-pages');

const cityCoords = JSON.parse(fs.readFileSync(cityCoordsPath, 'utf8'));
const stateMap = JSON.parse(fs.readFileSync(stateMapPath, 'utf8'));

// Ensure html-pages directory exists
if (!fs.existsSync(htmlPagesDir)) {
  fs.mkdirSync(htmlPagesDir, { recursive: true });
}

// Parse CLI args
var FORCE = process.argv.includes('--force');
var TEST_KEY = null;
var testIdx = process.argv.indexOf('--test');
if (testIdx >= 0 && process.argv[testIdx + 1]) {
  TEST_KEY = process.argv[testIdx + 1]; // e.g. "TX|Flower Mound"
}

// Special slug overrides for cities whose URL differs from simple slugification
const SLUG_OVERRIDES = {
  'NY|New York City': 'new-york-city',
  'MO|Saint Louis': 'st-louis',
  'MO|St. Louis': 'st-louis',
  'MN|Saint Paul': 'st-paul',
  'DC|Washington': 'washington-dc'
};

function slugify(name) {
  return name.toLowerCase().replace(/[\s.]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function buildUrl(stateCode, cityName, key) {
  var slug = SLUG_OVERRIDES[key] || slugify(cityName);
  var st = stateCode.toLowerCase();
  if (stateCode === 'DC') return 'https://livability.com/dc/' + slug + '/';
  return 'https://livability.com/' + st + '/' + slug + '/';
}

function htmlFilename(stateCode, cityName, key) {
  var slug = SLUG_OVERRIDES[key] || slugify(cityName);
  return stateCode.toUpperCase() + '-' + slug + '.html';
}

function fetchPage(url, maxRedirects) {
  if (maxRedirects == null) maxRedirects = 5;
  return new Promise(function (resolve, reject) {
    var mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CityDataBot/1.0)' } }, function (res) {
      if ((res.statusCode === 301 || res.statusCode === 302) && maxRedirects > 0) {
        res.resume();
        var loc = res.headers.location;
        if (loc && !loc.startsWith('http')) {
          var parsed = new URL(url);
          loc = parsed.origin + loc;
        }
        return fetchPage(loc, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () { resolve(Buffer.concat(chunks).toString('utf8')); });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseNumber(str) {
  if (!str) return null;
  var cleaned = str.replace(/[$,\s]/g, '').replace(/min$/i, '').trim();
  var n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function extractQuickFacts(html) {
  if (!html) return null;
  var facts = {};

  var patterns = [
    { key: 'medianHomeValue', regex: /Median\s+Home\s+Value[^$]*?\$([0-9,]+)/i },
    { key: 'medianIncome', regex: /Median\s+Household\s+Income[^$]*?\$([0-9,]+)/i },
    { key: 'medianRent', regex: /Median\s+Monthly\s+Rent[^$]*?\$([0-9,]+)/i },
    { key: 'medianPropertyTax', regex: /Median\s+Property\s+Tax[^$]*?\$([0-9,]+)/i },
    { key: 'population', regex: /Total\s+Population[^0-9]*?([0-9,]+)/i },
    { key: 'avgCommute', regex: /Average\s+Commute[^0-9]*?([0-9]+)\s*min/i }
  ];

  patterns.forEach(function (p) {
    var m = html.match(p.regex);
    if (m) {
      facts[p.key] = parseNumber(m[1]);
    }
  });

  // Weather data ([\s\S]*? to match across HTML tags/newlines)
  var tempMatch = html.match(/Average\s+Temperatures[\s\S]*?(\d+)\s*high\s*\/\s*(\d+)\s*low/i);
  if (tempMatch) {
    facts.avgTempHighF = parseInt(tempMatch[1], 10);
    facts.avgTempLowF = parseInt(tempMatch[2], 10);
  }

  var rainMatch = html.match(/Average\s+Annual\s+Rainfall[\s\S]*?(\d+)\s*in/i);
  if (rainMatch) {
    facts.annualRainfallIn = parseInt(rainMatch[1], 10);
  }

  var snowMatch = html.match(/Average\s+Annual\s+Snowfall[\s\S]*?(\d+)\s*in/i);
  if (snowMatch) {
    facts.annualSnowfallIn = parseInt(snowMatch[1], 10);
  }

  return Object.keys(facts).length >= 2 ? facts : null;
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function buildLivabilityObj(facts) {
  return {
    medianHomeValue: facts.medianHomeValue || null,
    medianIncome: facts.medianIncome || null,
    medianRent: facts.medianRent || null,
    medianPropertyTax: facts.medianPropertyTax || null,
    avgCommute: facts.avgCommute || null,
    avgTempHighF: facts.avgTempHighF != null ? facts.avgTempHighF : null,
    avgTempLowF: facts.avgTempLowF != null ? facts.avgTempLowF : null,
    annualRainfallIn: facts.annualRainfallIn != null ? facts.annualRainfallIn : null,
    annualSnowfallIn: facts.annualSnowfallIn != null ? facts.annualSnowfallIn : null
  };
}

async function scrapeList(cities, label) {
  console.log('=== Scraping ' + label + ': ' + cities.length + ' cities ===\n');
  var results = {};
  var success = 0;
  var failed = 0;
  var skipped = 0;

  for (var i = 0; i < cities.length; i++) {
    var c = cities[i];
    var key = c.stateCode + '|' + c.name;
    if (results[key]) { console.log('[' + (i+1) + '/' + cities.length + '] ' + c.name + ', ' + c.stateCode + ' ... CACHED'); continue; }

    var fname = htmlFilename(c.stateCode, c.name, key);
    var fpath = path.join(htmlPagesDir, fname);
    var url = buildUrl(c.stateCode, c.name, key);

    process.stdout.write('[' + (i + 1) + '/' + cities.length + '] ' + c.name + ', ' + c.stateCode + ' ... ');

    try {
      var html = null;

      // If HTML file already exists, read from disk (skip network) unless --force
      if (!FORCE && fs.existsSync(fpath)) {
        html = fs.readFileSync(fpath, 'utf8');
        var facts = extractQuickFacts(html);
        if (facts) {
          results[key] = facts;
          success++;
          skipped++;
          console.log('FROM DISK (' + Object.keys(facts).length + ' facts)');
        } else {
          // HTML exists but no data? re-fetch
          html = await fetchPage(url);
          if (html) {
            fs.writeFileSync(fpath, html, 'utf8');
          }
          facts = extractQuickFacts(html);
          if (facts) {
            results[key] = facts;
            success++;
            console.log('RE-FETCHED OK (' + Object.keys(facts).length + ' facts)');
          } else {
            failed++;
            console.log('NO DATA');
          }
        }
      } else {
        // Fetch from network
        html = await fetchPage(url);
        if (html) {
          // Save HTML page
          fs.writeFileSync(fpath, html, 'utf8');
          var facts = extractQuickFacts(html);
          if (facts) {
            results[key] = facts;
            success++;
            console.log('OK (' + Object.keys(facts).length + ' facts) → ' + fname);
          } else {
            failed++;
            console.log('NO DATA (HTML saved: ' + fname + ')');
          }
        } else {
          failed++;
          console.log('NO PAGE (404 or error)');
        }
      }
    } catch (err) {
      failed++;
      console.log('ERROR: ' + err.message);
    }

    // Rate limit only for network requests (not disk reads)
    if (!(!FORCE && fs.existsSync(fpath)) && i < cities.length - 1) await sleep(400);
  }

  console.log('\n=== ' + label + ': ' + success + ' OK (' + skipped + ' from disk), ' + failed + ' failed ===\n');
  return results;
}

async function main() {
  // Build list from city-coordinates.json
  var coordCities = Object.keys(cityCoords).map(function (key) {
    var parts = key.split('|');
    return { stateCode: parts[0], name: parts[1] };
  });

  // Build list from _bestCities in state-map.json
  var bestCities = (stateMap._bestCities || []).map(function (c) {
    return { stateCode: c.stateCode, name: c.name };
  });

  // Build list from _livabilityCities in state-map.json
  var livCities = (stateMap._livabilityCities || []).map(function (c) {
    return { stateCode: c.state, name: c.name };
  });

  // Merge and deduplicate
  var seen = {};
  var allCities = [];
  coordCities.concat(bestCities).concat(livCities).forEach(function (c) {
    var key = c.stateCode + '|' + c.name;
    if (!seen[key]) { seen[key] = true; allCities.push(c); }
  });

  // If --test mode, filter to just that city
  if (TEST_KEY) {
    allCities = allCities.filter(function (c) {
      return (c.stateCode + '|' + c.name) === TEST_KEY;
    });
    if (allCities.length === 0) {
      // Try to build test city from the key even if not in any list
      var parts = TEST_KEY.split('|');
      if (parts.length === 2) {
        allCities = [{ stateCode: parts[0], name: parts[1] }];
      }
    }
    console.log('TEST MODE: scraping only ' + TEST_KEY + '\n');
    FORCE = true; // always re-fetch in test mode
  }

  var results = await scrapeList(allCities, 'All cities (coords + best + livability)');

  // Inject into topCities
  var enriched = 0;
  Object.keys(stateMap).forEach(function (code) {
    if (code.startsWith('_')) return;
    var state = stateMap[code];
    if (!state || !state.topCities) return;

    state.topCities.forEach(function (city) {
      var key = code + '|' + city.name;
      var facts = results[key];
      if (facts) {
        city.livability = buildLivabilityObj(facts);
        if (facts.population) city.population = facts.population;
        enriched++;
      }
    });
  });

  // Inject into _bestCities directly
  var bestEnriched = 0;
  if (stateMap._bestCities && Array.isArray(stateMap._bestCities)) {
    stateMap._bestCities.forEach(function (city) {
      var key = city.stateCode + '|' + city.name;
      var facts = results[key];
      if (facts) {
        city.livability = buildLivabilityObj(facts);
        bestEnriched++;
      }
    });
  }

  // Inject into _livabilityCities
  var livEnriched = 0;
  if (stateMap._livabilityCities && Array.isArray(stateMap._livabilityCities)) {
    stateMap._livabilityCities.forEach(function (city) {
      var key = city.state + '|' + city.name;
      var facts = results[key];
      if (facts) {
        city.livability = buildLivabilityObj(facts);
        if (facts.population) city.population = facts.population;
        livEnriched++;
      }
    });
  }

  fs.writeFileSync(stateMapPath, JSON.stringify(stateMap, null, 2), 'utf8');
  console.log('Enriched ' + enriched + ' topCities + ' + bestEnriched + ' bestCities + ' + livEnriched + ' livabilityCities in state-map.json');
  console.log('HTML pages saved in: ' + htmlPagesDir);
  console.log('Done!');
}

main().catch(function (err) { console.error(err); process.exit(1); });
