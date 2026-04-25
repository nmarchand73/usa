/**
 * Generate public/bordeaux-map.html from public/lyon-map.html template.
 *
 * Rationale: keep one high-quality base UI and apply targeted Bordeaux-specific replacements
 * (data file names, labels, and quartier layer instead of arrondissements).
 */
const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '..');
const SRC = path.join(BASE, 'public', 'lyon-map.html');
const OUT = path.join(BASE, 'public', 'bordeaux-map.html');

function replaceAllSafe(s, from, to) {
  if (!s.includes(from)) throw new Error(`Replacement not found: ${from}`);
  return s.split(from).join(to);
}

function replaceRe(s, re, to) {
  if (!re.test(s)) throw new Error(`Regex replacement not found: ${re}`);
  return s.replace(re, to);
}

function main() {
  let html = fs.readFileSync(SRC, 'utf8');

  // Title + hero
  html = replaceRe(
    html,
    /<title>[\s\S]*?<\/title>/,
    '<title>Bordeaux — où habiter (Actu + Lacartedescolocs)</title>'
  );
  html = replaceAllSafe(html, '<h1>Lyon + métropole — repères “où habiter”</h1>', '<h1>Bordeaux + métropole — repères “où habiter”</h1>');

  // Switch data files
  html = replaceAllSafe(html, "fetch('lyon-data.json')", "fetch('bordeaux-data.json')");
  html = replaceAllSafe(html, "fetch('lyon-iso-grid.json')", "fetch('bordeaux-iso-grid.json')");
  html = replaceAllSafe(html, "fetch('lyon-dvf-heatmap.json')", "fetch('bordeaux-dvf-heatmap.json')");
  html = replaceAllSafe(html, "dvfHeatGrid.kind !== 'lyonDvfHouseHeatmap'", "dvfHeatGrid.kind !== 'bordeauxDvfHouseHeatmap'");

  // Layer naming: arrondissements (CityCrunch) -> quartiers (lacartedescolocs)
  html = replaceAllSafe(html, 'Arrondissements (CityCrunch)', 'Quartiers (Lacartedescolocs)');
  html = replaceAllSafe(html, 'Arrondissement (CityCrunch)', 'Quartier (Lacartedescolocs)');

  // Constants: CityCrunch URL -> lacartedescolocs guide
  html = replaceRe(
    html,
    /const CCR = 'https:\/\/lyon\.citycrunch\.fr\/[^']+';/,
    "const CCR = 'https://www.lacartedescolocs.fr/guides/logement-bordeaux-les-meilleurs-quartiers';"
  );

  // Data payload sources: sources.citycrunch -> sources.lacartedescolocs
  html = replaceAllSafe(html, 'sources.citycrunch', 'sources.lacartedescolocs');

  // Kinds + scoring: arrondissement/citycrunch -> quartier/lacartedescolocs
  html = replaceAllSafe(html, "item.kind === 'arrondissement'", "item.kind === 'quartier'");
  html = replaceAllSafe(html, 'item.scores.citycrunch', 'item.scores.lacartedescolocs');
  html = replaceAllSafe(html, 'item.why.citycrunch', 'item.why.lacartedescolocs');

  // Text labels inside popups
  html = replaceAllSafe(html, 'Avis (échelle CityCrunch dérivée)', 'Avis (Lacartedescolocs)');
  html = replaceAllSafe(html, 'CityCrunch (dérivé)', 'Lacartedescolocs');
  html = replaceAllSafe(html, 'CityCrunch : ', 'Lacartedescolocs : ');

  // Default map view: Bordeaux area
  html = replaceRe(
    html,
    /setView\(\[45\.764, 4\.835\], 11\)/,
    'setView([44.84, -0.58], 11)'
  );

  fs.writeFileSync(OUT, html, 'utf8');
  console.log('→', OUT);
}

main();

