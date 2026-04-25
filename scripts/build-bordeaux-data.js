/**
 * Copy map-data/bordeaux-zones.json to public/bordeaux-data.json with a builtAt timestamp.
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const SRC = path.join(BASE, 'map-data', 'bordeaux-zones.json');
const OUT = path.join(BASE, 'public', 'bordeaux-data.json');

const data = JSON.parse(fs.readFileSync(SRC, 'utf8'));
data.builtAt = new Date().toISOString();

fs.writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('→', OUT, 'builtAt:', data.builtAt);

