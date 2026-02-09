/**
 * extract-livability-details.js
 * Parses all HTML files in html-pages/ and extracts rich livability data:
 *   - 8 category scores (amenities, economy, education, environment, health, housing, safety, transportation)
 *   - Top 3 categories
 *   - Hero image URL
 *   - Short description (bp23-excerpt)
 *   - Content sections (location, economy, things to do, outdoors, restaurants, education)
 *   - FAQs from JSON-LD schema
 *
 * Outputs:
 *   - livability-details.json  (full data keyed by slug)
 *   - Updates state-map.json   (_livabilityCities entries get "categories" field)
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const HTML_DIR = path.join(BASE, 'html-pages');
const OUT_FILE = path.join(BASE, 'livability-details.json');
const STATE_MAP_FILE = path.join(BASE, 'state-map.json');

// ── Helpers ──────────────────────────────────────────────

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBetween(html, startPattern, endPattern) {
  const startIdx = html.search(startPattern);
  if (startIdx === -1) return null;
  const afterStart = html.indexOf('>', html.indexOf(html.match(startPattern)[0], startIdx)) + 1;
  const endIdx = html.indexOf(endPattern, afterStart);
  if (endIdx === -1) return null;
  return html.substring(afterStart, endIdx);
}

// ── Extractors ───────────────────────────────────────────

function extractCategories(html) {
  const cats = {};
  // Pattern: <p class="cat-detail-name amenities">Amenities<span>57
  const re = /cat-detail-name\s+(\w+)">[^<]*<span>(\d+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    cats[m[1].toLowerCase()] = parseInt(m[2], 10);
  }
  return Object.keys(cats).length > 0 ? cats : null;
}

function extractTopCategories(html) {
  // Pattern: livscore-block__cat-list ... <p>Category Name</p>
  const blockMatch = html.match(/livscore-block__cat-list([\s\S]*?)<\/ul>/);
  if (!blockMatch) return [];
  const cats = [];
  const re = /<p>([^<]+)<\/p>/g;
  let m;
  while ((m = re.exec(blockMatch[1])) !== null) {
    cats.push(stripHtml(m[1]));
  }
  return cats;
}

function extractHeroImage(html) {
  // <link ... as="image" href="...hero..."
  const m = html.match(/<link[^>]*as="image"[^>]*href="([^"]*hero[^"]*)"/);
  if (m) return m[1].replace(/\.webp$/, '');
  // fallback: og:image
  const og = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);
  return og ? og[1] : null;
}

function extractDescription(html) {
  const m = html.match(/<p class="bp23-excerpt">([\s\S]*?)<\/p>/);
  return m ? stripHtml(m[1]) : null;
}

function extractCityState(html) {
  // From <title>Living in City, ST ...
  const m = html.match(/<title>Living in ([^,]+),\s*(\w{2})/);
  if (m) return { city: m[1].trim(), state: m[2].trim() };
  return { city: null, state: null };
}

function extractSections(html) {
  const sections = {};
  const sectionDefs = [
    { key: 'location', id: 'location' },
    { key: 'economy', id: 'economy' },
    { key: 'thingsToDo', id: 'things' },
    { key: 'outdoors', id: 'outdoor' },
    { key: 'restaurants', id: 'restaurants' },
    { key: 'education', id: 'schools' },
  ];

  for (const def of sectionDefs) {
    // Find the section heading by id
    const headingRe = new RegExp('id="' + def.id + '"[^>]*>([\\s\\S]*?)(?=<div class="place-section-heading">|<div class="schema-faq|<div class="quick-facts|<figure|$)');
    // Better approach: find the h2 with this id, then grab text until next section heading
    const sectionStart = html.indexOf('id="' + def.id + '"');
    if (sectionStart === -1) continue;

    // Find the end of the heading tag
    const afterHeading = html.indexOf('</h2>', sectionStart);
    if (afterHeading === -1) continue;
    const contentStart = afterHeading + 5;

    // Find the next section heading or end marker
    const nextSection = html.indexOf('<div class="place-section-heading">', contentStart);
    const nextQuickFacts = html.indexOf('<div class="quick-facts', contentStart);
    const mapSection = html.indexOf('<h2 id="map"', contentStart);

    let contentEnd = html.length;
    for (const end of [nextSection, nextQuickFacts, mapSection]) {
      if (end > contentStart && end < contentEnd) contentEnd = end;
    }

    let rawContent = html.substring(contentStart, contentEnd);
    // Remove FAQ blocks, figures, images from the section text
    rawContent = rawContent.replace(/<div class="schema-faq[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
    rawContent = rawContent.replace(/<figure[\s\S]*?<\/figure>/g, '');

    const text = stripHtml(rawContent);
    if (text.length > 20) {
      sections[def.key] = text;
    }
  }
  return sections;
}

function extractFaqs(html) {
  const faqs = [];
  try {
    // Extract JSON-LD
    const ldMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
    if (!ldMatch) return faqs;
    const ld = JSON.parse(ldMatch[1]);
    const graph = ld['@graph'] || [];
    for (const item of graph) {
      if (item['@type'] === 'Question' && item.acceptedAnswer) {
        faqs.push({
          q: stripHtml(item.name || ''),
          a: stripHtml(item.acceptedAnswer.text || '')
        });
      }
    }
  } catch (e) {
    // Some files may not have valid JSON-LD
  }
  return faqs;
}

// ── Main ─────────────────────────────────────────────────

function main() {
  const files = fs.readdirSync(HTML_DIR).filter(f => f.endsWith('.html'));
  console.log(`Found ${files.length} HTML files to process`);

  const details = {};
  let processed = 0;
  let withCategories = 0;

  for (const file of files) {
    const slug = file.replace('.html', '');
    const html = fs.readFileSync(path.join(HTML_DIR, file), 'utf-8');

    const { city, state } = extractCityState(html);
    const categories = extractCategories(html);
    const topCategories = extractTopCategories(html);
    const heroImage = extractHeroImage(html);
    const description = extractDescription(html);
    const sections = extractSections(html);
    const faqs = extractFaqs(html);

    if (categories) withCategories++;

    details[slug] = {
      city: city || slug.split('-').slice(1).join(' '),
      state: state || slug.split('-')[0],
      heroImage,
      description,
      categories,
      topCategories,
      sections,
      faqs
    };

    processed++;
    if (processed % 20 === 0) console.log(`  Processed ${processed}/${files.length}...`);
  }

  // Write livability-details.json
  fs.writeFileSync(OUT_FILE, JSON.stringify(details, null, 2), 'utf-8');
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`  Total entries: ${Object.keys(details).length}`);
  console.log(`  With category scores: ${withCategories}`);

  // ── Phase 2: Inject categories into state-map.json ──
  console.log('\nPhase 2: Enriching state-map.json with category scores...');
  const stateMap = JSON.parse(fs.readFileSync(STATE_MAP_FILE, 'utf-8'));
  const livCities = stateMap._livabilityCities || [];
  let enriched = 0;

  for (const city of livCities) {
    // Build possible slug keys to match
    const citySlug = city.name.toLowerCase()
      .replace(/\./g, '')
      .replace(/'/g, '')
      .replace(/\s+/g, '-');
    const stateCode = city.state;
    const key = stateCode + '-' + citySlug;

    // Try exact match first, then fuzzy
    let detail = details[key];
    if (!detail) {
      // Try all keys starting with the state code
      const candidates = Object.keys(details).filter(k => k.startsWith(stateCode + '-'));
      for (const cand of candidates) {
        const d = details[cand];
        if (d.city && d.city.toLowerCase() === city.name.toLowerCase()) {
          detail = d;
          break;
        }
      }
    }

    if (detail && detail.categories) {
      city.categories = detail.categories;
      if (detail.topCategories && detail.topCategories.length > 0) {
        city.topCategories = detail.topCategories;
      }
      enriched++;
    }
  }

  fs.writeFileSync(STATE_MAP_FILE, JSON.stringify(stateMap, null, 2), 'utf-8');
  console.log(`  Enriched ${enriched}/${livCities.length} livability cities with category scores`);
  console.log('Done!');
}

main();
