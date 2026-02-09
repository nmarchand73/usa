/**
 * Livre dont vous êtes le héros — La ville idéale aux USA (famille française)
 * Source unique : livability-details.json
 * Génère DOCX via le même modèle que travel-hero-book.
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageNumber, BorderStyle,
  WidthType, ShadingType, InternalHyperlink, Bookmark, PageBreak
} = require('docx');

const BOOK_CONFIG = {
  destination: "USA - Ville idéale pour une famille française",
  title: "La Ville Idéale : À la découverte des USA",
  subtitle: "Un livre dont vous êtes le héros",
  author: "Généré à partir de Livability.com",
  outputPath: path.join(__dirname, '..', 'book', 'Livre_Heros_USA_Ville_Ideale.docx'),
  language: "fr"
};

const DESIGN = {
  fonts: { display: "Cambria", heading: "Cambria", body: "Calibri", accent: "Calibri Light" },
  sizes: { bookTitle: 72, subtitle: 28, chapterTitle: 44, paragraphNumber: 28, body: 24, choice: 23, choiceNumber: 24, footer: 18, decorative: 16 },
  colors: { primary: "2C3E50", secondary: "E74C3C", accent: "F39C12", text: "2C3E50", textLight: "5D6D7E", link: "2980B9", decorative: "BDC3C7", box: "FEF9E7", boxBorder: "F5B041" },
  spacing: { paragraphBefore: 240, paragraphAfter: 240, lineHeight: 300, choiceBefore: 120, choiceAfter: 80, sectionGap: 480 }
};

const LABELS = {
  fr: {
    coverSubtitle: "Un livre dont vous êtes le héros",
    howToPlay: "Comment jouer",
    howToPlayText: "Vous incarnez une famille française en quête de la ville idéale pour s'installer aux États-Unis. À la fin de chaque paragraphe, faites un choix qui orientera votre exploration. Cliquez sur les numéros en bleu pour naviguer. Laissez-vous guider par vos priorités : écoles, nature, emploi, ou simple curiosité !",
    startText: "Cliquez sur le 1 ci-dessous pour commencer.",
    clickToStart: "COMMENCER L'AVENTURE",
    endText: "— FIN —",
    chapters: {
      prologue: "Prologue",
      education: "Éducation & Famille",
      nature: "Nature & Plein air",
      economy: "Économie & Emploi",
      culture: "Culture & Art de vivre",
      experiences: "Vie quotidienne",
      daytrips: "Régions & États",
      epilogue: "Épilogue"
    }
  }
};

// Load livability data
const jsonPath = path.join(__dirname, '..', 'map-data', 'livability-details.json');
const raw = fs.readFileSync(jsonPath, 'utf8');
const livability = JSON.parse(raw);

function getFullCities() {
  const list = [];
  for (const [key, data] of Object.entries(livability)) {
    if (!data || !data.description || typeof data.sections !== 'object') continue;
    const sec = data.sections;
    if (!sec.location && !sec.economy && !sec.thingsToDo) continue;
    list.push({ key, ...data, cityName: (data.city || key.replace(/^[A-Z]{2}-/, '')).replace(/\b\w/g, c => c.toUpperCase()) });
  }
  return list;
}

const fullCities = getFullCities();

function pick(arr, n) {
  const out = [];
  const step = Math.max(1, Math.floor(arr.length / n));
  for (let i = 0; i < n && i * step < arr.length; i++) out.push(arr[i * step]);
  return out;
}

// On n'insère jamais de texte anglais du JSON : tout le récit reste en français.
// excerpt() n'est plus utilisée pour le contenu narratif.
function excerpt(str, maxLen = 220) {
  if (!str || typeof str !== 'string') return '';
  const clean = str.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const lastSpace = clean.lastIndexOf(' ', maxLen);
  const cut = lastSpace > maxLen * 0.6 ? clean.slice(0, lastSpace) : clean.slice(0, maxLen).trim();
  return cut + (cut.length < clean.length ? '…' : '');
}

// City groups by theme (using keys that exist in our full list)
const byTheme = {
  education: fullCities.filter(c => (c.categories && c.categories.education >= 55) || /ann-arbor|troy|loveland|colorado-springs|cary|bloomington|naperville/i.test(c.key)),
  nature: fullCities.filter(c => (c.categories && c.categories.environment >= 55) || /asheville|durham|anchorage|colorado-springs|greensboro/i.test(c.key)),
  economy: fullCities.filter(c => (c.categories && c.categories.economy >= 55) || /raleigh|durham|charlotte|bloomington|huntsville|madison/i.test(c.key)),
  culture: fullCities.filter(c => (c.categories && (c.categories.amenities >= 60)) || /asheville|santa-fe|durham|charleston/i.test(c.key))
};

// Ensure we have at least one city per theme
const citiesEd = pick(byTheme.education.length ? byTheme.education : fullCities, 6);
const citiesNat = pick(byTheme.nature.length ? byTheme.nature : fullCities, 6);
const citiesEco = pick(byTheme.economy.length ? byTheme.economy : fullCities, 6);
const citiesCul = pick(byTheme.culture.length ? byTheme.culture : fullCities, 5);

function para(num, section, text, choices, isEnding = false, endingType = null) {
  return { number: num, section, text, choices: choices || [], isEnding, endingType };
}

function buildParagraphs() {
  const P = [];
  const c = (n, t) => ({ target: n, text: t });

  // —— PROLOGUE 1-5 ——
  P.push(para(1, 'prologue',
    `Vous êtes à la table de la cuisine, cartes des États-Unis et listes de critères étalées devant vous. Depuis des mois, l'idée d'une nouvelle vie de l'autre côté de l'Atlantique grandit : meilleures écoles pour les enfants, plus d'espace, un cadre qui ressemble à vos rêves. Mais par où commencer ? Cinquante États, des milliers de villes. Vous décidez de structurer votre recherche comme une aventure — une quête dont vous tenez les choix.\n\nVous fixez trois axes possibles : les villes où l'éducation et la famille passent d'abord ; celles qui offrent nature et plein air ; et celles où l'économie et l'emploi sont au cœur. Ou bien vous préférez vous laisser guider par l'instinct et une seule idée : « Où nous sentirait-on vraiment bien ? »`,
    [c(2, "Priorité écoles et famille"), c(3, "Priorité nature et cadre de vie"), c(4, "Priorité emploi et économie"), c(5, "Suivre l'instinct")]));

  P.push(para(2, 'prologue',
    `Vous cochez « Éducation et famille » en premier. Ann Arbor, dans le Michigan, revient souvent dans les classements : une ville universitaire où les écoles publiques sont parmi les meilleures de l'État. Les données que vous avez sous les yeux mentionnent un coût de la vie légèrement au-dessus de la moyenne nationale, un revenu médian des ménages élevé, et des établissements comme le University of Michigan Museum of Art en accès gratuit. L'atmosphère décrite mêle esprit campus et vie de quartier.`,
    [c(6, "Explorer Ann Arbor et les villes « éducation »"), c(10, "Voir d'abord une ville nature")]));

  P.push(para(3, 'prologue',
    `Vous choisissez « Nature et cadre de vie ». Asheville, en Caroline du Nord, s'impose : nichée dans les Blue Ridge Mountains, elle combine paysages, communauté et une scène culinaire et brassicole réputée. Les textes que vous lisez évoquent des possibilités de randonnée, de vélo, de rafting, et un coût de la vie légèrement inférieur à la moyenne nationale. L'environnement et les équipements y sont bien notés.`,
    [c(26, "Explorer Asheville et les villes nature"), c(30, "Comparer avec une ville à fort emploi")]));

  P.push(para(4, 'prologue',
    `Vous mettez « Économie et emploi » en tête. Raleigh et le Research Triangle en Caroline du Nord apparaissent : technologie, santé, éducation, avec un coût de la vie souvent inférieur à la moyenne. Les données décrivent des emplois variés, des universités renommées à proximité, et un cadre qui attire les familles et les professionnels.`,
    [c(46, "Explorer Raleigh et les villes économie"), c(50, "Jeter un œil aux villes culture")]));

  P.push(para(5, 'prologue',
    `Vous décidez de suivre l'instinct. Vous parcourez des listes de « meilleures villes où vivre » sans filtre strict. Un nom revient : Durham. Innovation, créativité, quartiers historiques, universités de renom, arts et gastronomie. Une ville où l'on dit que les carrières et la créativité coexistent. Vous avez envie de creuser cette piste.`,
    [c(66, "Plonger dans Durham et les villes culture"), c(46, "Vérifier aussi l'économie et l'emploi")]));

  // —— ÉDUCATION 6-25 ——
  const annArbor = fullCities.find(x => x.key === 'MI-ann-arbor');
  const troy = fullCities.find(x => x.key === 'MI-troy');
  const loveland = fullCities.find(x => x.key === 'CO-loveland');
  const csprings = fullCities.find(x => x.key === 'CO-colorado-springs');

  P.push(para(6, 'education',
    annArbor ? `À Ann Arbor, vous vous projetez dans le quotidien décrit par les rapports : une ville dynamique au sud-est du Michigan, à moins d'une heure de Détroit. L'aéroport international est à environ 40 km. Les trois piliers économiques sont la fabrication, la santé et l'automobile ; des entreprises comme Google ou Nokia ont une présence marquée. Le coût de la vie est légèrement supérieur à la moyenne nationale ; la valeur médiane des logements et le revenu des ménages reflètent une population qualifiée. Pour les familles, Ann Arbor Public Schools est très bien classée et le district compte plus de 17 000 élèves. Les rapports soulignent une offre riche en activités culturelles, marchés et loisirs de plein air.` : "À Ann Arbor, écoles et université rythment la vie. Vous imaginez les parcs, les marchés et le stade du Big House.",
    [c(7, "Voir les activités et le cadre de vie"), c(11, "Comparer avec une autre ville éducation")]));

  P.push(para(7, 'education',
    annArbor ? `Vous creusez les « choses à faire » à Ann Arbor : musée d'art gratuit, Ann Arbor Art Fair, sentiers comme le Border-to-Border Trail, Argo Cascades au bord de la rivière Huron. Les brasseries sont si accueillantes pour les chiens que certaines proposent un menu dédié sur la terrasse. Les rapports décrivent une ville créative et sportive, idéale pour les enfants et les sorties en famille, avec de nombreux parcs et pistes cyclables.` : "Activités culturelles et plein air sont au rendez-vous.",
    [c(8, "Enchaîner avec une autre ville éducation"), c(15, "Passer aux villes nature")]));

  P.push(para(8, 'education',
    troy ? `Troy, au nord de Détroit, s'affiche comme une banlieue moderne : écoles très bien classées, quartiers sûrs, économie florissante. Le district scolaire de Troy est dans le top 100 national. Les données mentionnent le Troy Historic Village, le Somerset Collection pour le shopping, et des parcs, terrains de golf et espaces verts. Le revenu moyen des ménages y est parmi les plus élevés de votre liste. Une option rassurante pour les familles.` : "Troy mise sur les familles : écoles, sécurité, commerces.",
    [c(9, "Voir économie et emploi à Troy"), c(12, "Explorer les expériences quotidiennes")]));

  P.push(para(9, 'education',
    troy && troy.sections ? `À Troy, l'économie repose sur l'automobile, la R&D, l'ingénierie et les services financiers. Le coût de la vie est supérieur à la moyenne ; en contrepartie, les soins (Beaumont Hospital) et les écoles sont de premier plan. Vous notez les noms de Walsh College et Chamberlain University pour la formation. Les emplois qualifiés et la qualité de vie sont au rendez-vous.` : "Emplois qualifiés et soins de qualité caractérisent Troy.",
    [c(10, "Vers le hub nature"), c(20, "Vers économie & emploi")]));

  P.push(para(10, 'education',
    "Vous faites une pause et regardez la carte. Les villes « éducation » que vous avez vues — Ann Arbor, Troy — partagent des écoles solides et un cadre favorable aux familles. Vous pouvez enchaîner avec des villes où la nature et le plein air sont mis en avant, ou rester dans le thème éducation avec une ville comme Loveland ou Colorado Springs.",
    [c(11, "Loveland / Colorado Springs (éduc.)"), c(26, "Asheville (nature)")]));

  P.push(para(11, 'education',
    loveland ? `Loveland, au nord du Colorado, est décrite comme une ville où il est « facile de tomber amoureux » : cadre magnifique, excellente éducation, communauté festive. Le Thompson School District dessert plus de 15 000 élèves ; des écoles privées et charters complètent l'offre. Les parcs de sculptures (Chapungu, Benson), le Rocky Mountain National Park à proximité, et une scène artistique reconnue en font un candidat sérieux pour les familles.` : "Loveland allie montagne, écoles et vie de communauté.",
    [c(12, "Colorado Springs (éduc. & nature)"), c(16, "Vers économie")]));

  P.push(para(12, 'education',
    csprings ? `Colorado Springs, au pied des Rocheuses, cumule paysages et opportunités. Les données citent le Cheyenne Mountain School District comme l'un des meilleurs de l'État, des programmes STEM et d'immersion linguistique, et des établissements privés bien notés. Le coût de la vie est plus élevé qu'au niveau national mais plus abordable qu'à Denver. Les emplois dans la défense, l'aérospatiale et la tech attirent de nombreux foyers.` : "Colorado Springs : écoles de haut niveau et cadre montagnard.",
    [c(13, "Vie quotidienne à Colorado Springs"), c(27, "Asheville (nature)")]));

  P.push(para(13, 'education',
    csprings && csprings.sections ? `Vous lisez la section « choses à faire » à Colorado Springs : Garden of the Gods (gratuit), Pikes Peak Center, Old Colorado City, Broadmoor, zoo, rafting. Pour les enfants : Seven Falls et des adresses familiales. Les restaurants vont des brasseries conviviales aux tables gastronomiques, avec même un établissement qui accueille les chiens en salle. La vie quotidienne semble agréable et variée.` : "Activités et gastronomie complètent le tableau.",
    [c(14, "Résumer vos critères éducation"), c(81, "Explorer la vie quotidienne ailleurs")]));

  P.push(para(14, 'education',
    "Vous avez parcouru plusieurs villes axées éducation et famille : Ann Arbor, Troy, Loveland, Colorado Springs. Chacune offre des écoles solides, un cadre agréable et des activités adaptées aux familles. Vous pouvez soit approfondir une de ces pistes, soit élargir vers la nature ou l'économie.",
    [c(15, "Passer aux villes nature"), c(46, "Passer à l'économie et l'emploi"), c(98, "Vous avez assez vu — conclure en explorateur")]));

  P.push(para(15, 'education',
    "Vous décidez de quitter le thème « éducation » pour explorer les villes où la nature et le plein air dominent. La carte vous mène vers Asheville, Durham, ou encore Anchorage pour les plus aventureux.",
    [c(26, "Asheville"), c(30, "Durham (nature + économie)")]));

  // 16-25 more education / convergence
  for (let i = 16; i <= 25; i++) {
    const isHub = i === 20 || i === 25;
    if (i === 20) {
      P.push(para(20, 'education', "Vous êtes au carrefour : vous avez vu des villes où l'éducation et la famille sont prioritaires. Souhaitez-vous enchaîner avec l'économie et l'emploi, ou avec la culture et l'art de vivre ?", [c(46, "Économie & emploi"), c(66, "Culture & art de vivre")]));
    } else if (i === 25) {
      P.push(para(25, 'education', "Fin de la séquence « Éducation & famille ». Vous pouvez enchaîner avec la nature, l'économie ou les expériences du quotidien.", [c(26, "Nature"), c(46, "Économie"), c(81, "Vie quotidienne")]));
    } else {
      const city = citiesEd[i % citiesEd.length];
      const name = city ? city.cityName : 'Une ville';
      P.push(para(i, 'education', `Vous consultez les fiches d'autres villes du même type. ${name} revient souvent dans les classements pour ses écoles et son cadre favorable aux familles. Les critères éducation et famille restent au centre de votre recherche.`, [c(i + 1 <= 25 ? i + 1 : 26, "Suite"), c(26, "Nature")]));
    }
  }

  // —— NATURE 26-45 ——
  const asheville = fullCities.find(x => x.key === 'NC-asheville');
  const durham = fullCities.find(x => x.key === 'NC-durham');

  P.push(para(26, 'nature',
    asheville ? `Asheville, dans les Blue Ridge Mountains en Caroline du Nord, correspond à votre critère « nature et cadre de vie ». Les rapports décrivent une ville qui mêle beauté naturelle et sens de la communauté : gastronomie et brasseries, opportunités économiques variées, accès facile à une multitude d'activités de plein air. L'environnement y est très bien noté : randonnée, vélo, rivière et forêts sont à proximité.` : "Asheville : montagnes, communauté et plein air.",
    [c(27, "Activités et culture à Asheville"), c(31, "Comparer avec Durham")]));

  P.push(para(27, 'nature',
    asheville && asheville.sections ? `À Asheville, les activités vont du River Arts District au Biltmore Estate, en passant par les forêts (Pisgah, Nantahala), la Blue Ridge Parkway et le French Broad River. La ville mise sur la gastronomie et les brasseries — plus de cinquante —, des salles de concert reconnues et une scène artistique vivante. Pour les enfants : musée des sciences, arboretum et centre de la nature. Une ville où culture et plein air se répondent.` : "Culture, gastronomie et nature se croisent à Asheville.",
    [c(28, "Économie et coût de la vie"), c(40, "Hub nature")]));

  P.push(para(28, 'nature',
    asheville && asheville.sections ? `L'économie d'Asheville repose sur la santé, le tourisme et la manufacture. Mission Health, Buncombe County Schools et The Biltmore Company sont parmi les principaux employeurs. Le coût de la vie est légèrement inférieur à la moyenne nationale ; la valeur médiane des logements et le revenu des ménages en font une option réaliste pour beaucoup de familles.` : "Économie diversifiée et coût de la vie raisonnable.",
    [c(29, "Enchaîner avec une autre ville nature"), c(46, "Passer à l'économie")]));

  P.push(para(29, 'nature',
    "Vous parcourez d'autres fiches « nature » : Colorado Springs (déjà vue en éducation), Anchorage (nature extrême, aurores boréales), ou des villes du Midwest et du Sud avec parcs et lacs. Chaque ville a son équilibre entre nature, emploi et écoles.",
    [c(30, "Durham (nature + innovation)"), c(40, "Hub nature")]));

  P.push(para(30, 'nature',
    durham ? `Durham, au cœur du Research Triangle en Caroline du Nord, allie innovation et créativité. Les quartiers historiques, la beauté naturelle, les universités de renom et une scène artistique et gastronomique reconnue en font un candidat à la fois « nature » et « économie ». L'environnement y est très bien noté : sentiers (American Tobacco Trail, Eno River), jardins (Sarah P. Duke Gardens) et espaces verts pour toute la famille.` : "Durham : innovation, nature et culture.",
    [c(31, "Choses à faire à Durham"), c(47, "Économie de Durham")]));

  P.push(para(31, 'nature',
    durham && durham.sections ? `À Durham : American Tobacco Trail (plus de 35 km), Eno River State Park, Sarah P. Duke Gardens, Duke Forest. DPAC et Carolina Theatre pour les arts ; Duke Lemur Center pour les enfants. Murals, librairies, restaurants primés. Une ville où l'on vit bien, avec une offre culturelle et de plein air très complète.` : "Sentiers, jardins, arts et gastronomie à Durham.",
    [c(32, "Autres villes nature"), c(66, "Culture")]));

  for (let i = 32; i <= 39; i++) {
    const city = citiesNat[i % citiesNat.length];
    const name = city ? city.cityName : '';
    P.push(para(i, 'nature', city ? `Vous explorez la fiche de ${name}. Les rapports mettent en avant le cadre de vie, les espaces verts et les activités de plein air. Une option à garder en tête pour allier nature et qualité de vie.` : "Vous parcourez d'autres villes où nature et cadre de vie priment.", [c(i + 1, "Suite"), c(40, "Hub nature")]));
  }

  P.push(para(40, 'nature', "Vous avez vu plusieurs villes « nature » : Asheville, Durham, Colorado Springs, et d'autres. Vous pouvez enchaîner avec l'économie et l'emploi, la culture, ou les expériences du quotidien.", [c(46, "Économie"), c(66, "Culture"), c(81, "Vie quotidienne")]));

  for (let i = 41; i <= 45; i++) {
    P.push(para(i, 'nature', "Vous consolidez vos notes sur les villes nature : parcs, sentiers, qualité de l'air, activités familiales. Chaque ville a ses atouts ; tout dépend de ce que vous placez en priorité.", [c(i < 45 ? i + 1 : 46, "Suite"), c(93, "Explorer une région en détail")]));
  }

  // —— ÉCONOMIE 46-65 ——
  const raleigh = fullCities.find(x => x.key === 'NC-raleigh');
  const bloomingtonMN = fullCities.find(x => x.key === 'MN-bloomington');

  P.push(para(46, 'economy',
    raleigh ? `Raleigh et le Triangle (Raleigh-Durham-Chapel Hill) sont décrits comme un pôle technologique, santé et éducation. Les données que vous consultez soulignent la croissance de l'emploi, la présence d'universités de renom et un coût de la vie souvent inférieur à celui des grandes métropoles. Un cadre attractif pour les familles et les actifs.` : "Raleigh et le Research Triangle : emploi et qualité de vie.",
    [c(47, "Durham (économie)"), c(51, "Charlotte (économie)")]));

  P.push(para(47, 'economy',
    durham && durham.sections ? `À Durham, l'économie repose sur la technologie, la santé et l'éducation. Duke Energy est implanté ici ; le coût de la vie est légèrement inférieur à la moyenne nationale. Le système de santé Duke est parmi les meilleurs du pays. Les opportunités d'emploi et la qualité des soins en font un pôle très attractif.` : "Durham : tech, santé, éducation et coût de la vie maîtrisé.",
    [c(48, "Emplois et employeurs"), c(66, "Culture à Durham")]));

  P.push(para(48, 'economy',
    "Vous comparez les principaux employeurs et secteurs : santé, tech, universités, aérospatiale, finance. Chaque ville a son mix ; Raleigh-Durham, Charlotte, Bloomington (MN), Huntsville sortent du lot pour la diversité et les opportunités.",
    [c(49, "Bloomington MN"), c(52, "Charlotte en détail")]));

  P.push(para(49, 'economy',
    bloomingtonMN ? `Bloomington (Minnesota), dans l'agglomération de Minneapolis–Saint Paul, est décrite comme un emplacement de choix pour les familles et les actifs : écoles de qualité, économie robuste, nombreuses activités de plein air. Health Partners, Best Buy, Mall of America et Dairy Queen y ont leur siège ou une présence majeure. Le coût de la vie est typiquement inférieur à la moyenne nationale.` : "Bloomington MN : emplois, Mall of America, qualité de vie.",
    [c(50, "Vers culture"), c(53, "Suite économie")]));

  P.push(para(50, 'economy',
    "Vous basculez vers les villes où la culture et l'art de vivre sont mis en avant — tout en gardant en tête l'économie. Asheville, Santa Fe, Durham et Charleston reviennent souvent.",
    [c(66, "Culture & art de vivre"), c(51, "Charlotte")]));

  const charlotte = fullCities.find(x => x.key === 'NC-charlotte');
  P.push(para(51, 'economy',
    charlotte && charlotte.sections ? `Charlotte est présentée comme l'un des principaux pôles bancaires après New York (Bank of America, Wells Fargo, Truist). Fortune 500, logistique, aérospatiale et tech renforcent une économie diversifiée. Le coût de la vie est généralement inférieur à celui des grandes métropoles ; pas d'impôt sur le revenu au niveau ville. Les perspectives d'emploi et le cadre de vie séduisent beaucoup de foyers.` : "Charlotte : finance, emploi et coût de la vie attractif.",
    [c(52, "Éducation et quartiers à Charlotte"), c(56, "Hub économie")]));

  P.push(para(52, 'economy',
    charlotte && charlotte.sections ? `À Charlotte, les quartiers populaires incluent South End, University City, Plaza Midwood, Ballantyne, Myers Park. Charlotte-Mecklenburg Schools propose des écoles de quartier, des programmes magnétiques et des académies spécialisées (STEM, arts). UNC Charlotte, Davidson College, Queens University et Johnson C. Smith University sont à proximité ou en ville. Une offre éducative et résidentielle très complète.` : "Écoles et quartiers font de Charlotte une option famille.",
    [c(53, "Suite économie"), c(81, "Vie quotidienne")]));

  for (let i = 53; i <= 55; i++) {
    P.push(para(i, 'economy', "Vous enchaînez avec d'autres fiches économie : Huntsville, Madison, Fayetteville… Chaque ville a son tissu d'employeurs et son niveau de vie.", [c(i + 1, "Suite"), c(56, "Hub économie")]));
  }

  P.push(para(56, 'economy', "Vous avez parcouru plusieurs villes « économie & emploi ». Vous pouvez passer à la culture et l'art de vivre, à la vie quotidienne, ou à une région en particulier.", [c(66, "Culture"), c(81, "Vie quotidienne"), c(93, "Régions")]));

  for (let i = 57; i <= 65; i++) {
    P.push(para(i, 'economy', "Vous consolidez vos critères économie : salaires, coût de la vie, secteurs porteurs, équilibre travail / vie personnelle. La liste se précise.", [c(i < 65 ? i + 1 : 66, "Suite"), c(66, "Culture")]));
  }

  // —— CULTURE 66-80 ——
  const santaFe = fullCities.find(x => x.key === 'NM-santa-fe');
  P.push(para(66, 'culture',
    durham ? `Durham revient sous l'angle « culture et art de vivre » : innovation et créativité, quartiers historiques, musées (Nasher, DPAC, Carolina Theatre), Duke Lemur Center, American Tobacco Campus, gastronomie (Saltbox, Bull City Burger, Fullsteam). Une ville où carrières et créativité coexistent, avec une scène culinaire et brassicole très vivante.` : "Durham : culture, arts et gastronomie.",
    [c(67, "Asheville (culture)"), c(70, "Santa Fe")]));

  P.push(para(67, 'culture',
    asheville && asheville.sections ? `Asheville côté culture : River Arts District, Biltmore Estate, Folk Art Center, salles de concert de renom, drum circle le vendredi soir, restaurants primés (dont Chai Pani), plus de 50 brasseries. Une ville qui mise sur la gastronomie et les arts. Les repas en terrasse et les sorties culturelles font partie du quotidien.` : "Asheville : arts, musique et gastronomie.",
    [c(68, "Charleston si présent"), c(71, "Hub culture")]));

  const charleston = fullCities.find(x => x.key === 'SC-charleston');
  P.push(para(68, 'culture',
    charleston ? `Charleston (Caroline du Sud) apparaît dans vos recherches : histoire, architecture, plages, gastronomie et sens de la communauté. Les données décrivent une ville où le charme du Sud et une scène culturelle vivante attirent de nombreux foyers. Rues pavées, maisons colorées, cuisine réputée et cadre côtier en font une candidate sérieuse pour qui privilégie l'art de vivre.` : "Charleston : histoire, mer et culture.",
    [c(69, "Suite culture"), c(81, "Vie quotidienne")]));

  for (let i = 69; i <= 70; i++) {
    P.push(para(i, 'culture', santaFe ? `Santa Fe (Nouveau-Mexique) : arts, patrimoine et paysages du désert. Les musées, galeries et cuisine locale en font une destination culturelle majeure. Une ville à l'identité forte, très différente des métropoles de la côte.` : "Vous parcourez des villes à forte identité culturelle : arts, gastronomie, patrimoine.", [c(i + 1, "Suite"), c(71, "Hub culture")]));
  }

  P.push(para(71, 'culture', "Vous avez exploré des villes « culture & art de vivre » : Durham, Asheville, Santa Fe, Charleston. Prochaine étape : vie quotidienne (restaurants, quartiers) ou régions.", [c(81, "Vie quotidienne"), c(93, "Régions")]));

  for (let i = 72; i <= 80; i++) {
    P.push(para(i, 'culture', "Vous affinez votre liste en fonction de la culture, des loisirs et du cadre de vie. Chaque ville a son caractère.", [c(i < 80 ? i + 1 : 81, "Suite"), c(81, "Vie quotidienne")]));
  }

  // —— EXPÉRIENCES 81-92 ——
  P.push(para(81, 'experiences',
    "Vous vous concentrez sur la « vie quotidienne » : où faire les courses, où manger, où sortir en famille. Les fiches détaillent marchés fermiers, cafés, brasseries, restaurants recommandés, activités gratuites et sorties avec enfants.",
    [c(82, "Restaurants et cafés"), c(86, "Activités famille")]));

  P.push(para(82, 'experiences',
    "Vous lisez les sections « restaurants » et « cafés » de plusieurs villes : Zingerman's à Ann Arbor, Chai Pani à Asheville, Saltbox à Durham, Pub Dog à Colorado Springs, La Farm Bakery à Cary (un secret local « comme en France »). Chaque ville a ses adresses cultes.",
    [c(83, "Brasseries et vie nocturne"), c(90, "Vers épilogue")]));

  P.push(para(83, 'experiences',
    "Brasseries et vie sociale : Asheville (nombre record de brasseries par habitant), Durham (Fullsteam, Ponysaurus), Ann Arbor (Grizzly Peak, menu pour chiens), Colorado Springs (Bristol, Goat Patch). Les happy hours et terrasses font partie du mode de vie.",
    [c(84, "Marchés et commerces"), c(91, "Conclure")]));

  P.push(para(84, 'experiences',
    "Marchés fermiers et commerces de proximité : Ann Arbor Farmers Market (Kerrytown), Bloomington Farmers Market, Asheville, Durham, Greenville NC (Dickinson Avenue). Vous notez les noms pour vous projeter dans une routine du samedi matin.",
    [c(85, "Activités gratuites et avec enfants"), c(92, "Dernière étape avant les fins")]));

  P.push(para(85, 'experiences',
    "Activités gratuites ou famille : musées gratuits (Ann Arbor), Garden of the Gods (Colorado Springs), murals à Durham, drum circle à Asheville, parcs et sentiers partout. Les fiches détaillent aussi zoos, aquariums et centres de découverte pour les enfants.",
    [c(86, "Résumé vie quotidienne"), c(93, "Explorer une région")]));

  P.push(para(86, 'experiences',
    "Vous faites le point sur la vie quotidienne : où vous voyez faire les courses, déjeuner en terrasse, emmener les enfants au parc ou au musée. Ces détails comptent autant que les classements.",
    [c(87, "Suite"), c(98, "Fin explorateur (parcours équilibré)")]));

  for (let i = 87; i <= 92; i++) {
    P.push(para(i, 'experiences', "Vous continuez à piocher dans les sections « choses à faire », « restaurants » et « quartiers » des fiches. Chaque détail vous rapproche d'une décision.", [c(i < 92 ? i + 1 : 93, "Suite"), c(93, "Régions")]));
  }

  // —— DAYTRIPS / RÉGIONS 93-97 ——
  P.push(para(93, 'daytrips',
    "Vous décidez d'explorer une région ou un État en particulier. Les fiches « location » décrivent les aéroports proches et les villes à proximité : par exemple depuis Asheville (Charlotte, Knoxville, Greenville SC), depuis Durham (Raleigh, Chapel Hill, Greensboro), depuis Ann Arbor (Détroit, Toledo, Lansing).",
    [c(94, "Caroline du Nord"), c(95, "Colorado / Michigan"), c(96, "Sud ou Midwest")]));

  P.push(para(94, 'daytrips',
    "Vous vous concentrez sur la Caroline du Nord : Raleigh, Durham, Chapel Hill (Research Triangle), Asheville (montagnes), Charlotte (finance), Greensboro, Wilmington (côte). Un État très divers pour les familles et l'emploi.",
    [c(97, "Retour et synthèse"), c(99, "Fin spécialiste (cœur Carolina)")]));

  P.push(para(95, 'daytrips',
    "Vous regardez le Colorado (Denver, Colorado Springs, Loveland, Boulder) et le Michigan (Ann Arbor, Troy, Détroit à proximité). Deux États où nature, éducation et économie se croisent.",
    [c(97, "Retour et synthèse"), c(100, "Fin aventurier (choix singulier)")]));

  P.push(para(96, 'daytrips',
    "Vous parcourez des fiches du Sud (Caroline du Sud, Géorgie, Alabama) ou du Midwest (Minnesota, Iowa, Nebraska). Chaque région a ses atouts : coût de la vie, communauté, climat, emplois.",
    [c(97, "Retour et synthèse"), c(100, "Fin aventurier")]));

  P.push(para(97, 'daytrips',
    "Vous revenez à votre tableau : types de villes explorés (éducation, nature, économie, culture), vie quotidienne, régions. Vous avez assez d'éléments pour conclure votre aventure et choisir une fin qui reflète votre parcours.",
    [c(98, "Explorateur complet"), c(99, "Spécialiste (une région/type)"), c(100, "Aventurier (instinct)")]));

  // —— ÉPILOGUES 98-100 ——
  P.push(para(98, 'epilogue',
    "Vous avez exploré plusieurs types de villes — éducation, nature, économie, culture — et parcouru les expériences du quotidien. Votre parcours équilibré vous a donné une vision large des États-Unis comme terre d'accueil pour une famille française : des écoles solides à Ann Arbor ou Troy, la nature à Asheville ou Colorado Springs, l'emploi à Raleigh-Durham ou Charlotte, la culture à Durham ou Asheville. Vous refermez le dossier avec une short list et la conviction qu'il existe plusieurs « bonnes » réponses. La suite : visites sur place, et un choix final en famille. — FIN EXPLORATEUR COMPLET —",
    [], true, 'explorer'));

  P.push(para(99, 'epilogue',
    "Votre exploration vous a conduit à creuser en profondeur un type de ville ou une région — par exemple la Caroline du Nord (Raleigh, Durham, Asheville) ou les villes « éducation » (Ann Arbor, Troy, Colorado Springs). Vous vous sentez moins en mode « comparaison large » qu'en mode « coup de cœur ». Vous notez les noms, les quartiers et les critères qui résonnent le plus. La ville idéale commence à avoir un visage. La prochaine étape : un voyage sur place pour valider. — FIN SPÉCIALISTE —",
    [], true, 'specialist'));

  P.push(para(100, 'epilogue',
    "Vous avez suivi votre instinct : une ville ou une région vous a surpris (peut-être Durham, Asheville, ou une escapade vers le Colorado ou le Michigan). Votre parcours n'a pas suivi une grille stricte ; il a épousé la curiosité. C'est souvent comme ça que les meilleures décisions se prennent. Vous gardez cette piste en tête et la mettez en balance avec les critères « objectifs ». L'aventure continue. — FIN AVENTURIER —",
    [], true, 'adventurer'));

  return P;
}

const PARAGRAPHS = buildParagraphs();

// ——— DOCX generation (same as skill) ———
function createBookmark(n) { return `para_${n}`; }
function createClickableLink(target, displayText) {
  return new InternalHyperlink({
    anchor: createBookmark(target),
    children: [new TextRun({ text: displayText || String(target), font: DESIGN.fonts.body, size: DESIGN.sizes.choiceNumber, bold: true, color: DESIGN.colors.link, underline: { type: "single", color: DESIGN.colors.link } })]
  });
}

function coverPage(config, lang) {
  const L = LABELS[lang];
  return [
    new Paragraph({ spacing: { before: 1800 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: config.title, font: DESIGN.fonts.display, size: DESIGN.sizes.bookTitle, bold: true, color: DESIGN.colors.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: L.coverSubtitle, font: DESIGN.fonts.accent, size: DESIGN.sizes.subtitle, italics: true, color: DESIGN.colors.textLight })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: "─────────  ✦  ─────────", font: DESIGN.fonts.accent, size: DESIGN.sizes.decorative, color: DESIGN.colors.decorative })] }),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [new TableCell({
          borders: { top: { style: BorderStyle.SINGLE, size: 12, color: DESIGN.colors.boxBorder }, bottom: { style: BorderStyle.SINGLE, size: 12, color: DESIGN.colors.boxBorder }, left: { style: BorderStyle.SINGLE, size: 2, color: DESIGN.colors.boxBorder }, right: { style: BorderStyle.SINGLE, size: 2, color: DESIGN.colors.boxBorder } },
          shading: { fill: DESIGN.colors.box, type: ShadingType.CLEAR },
          margins: { top: 400, bottom: 400, left: 500, right: 500 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: L.howToPlay, font: DESIGN.fonts.heading, size: 32, bold: true, color: DESIGN.colors.primary })] }),
            new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 250, line: 300 }, children: [new TextRun({ text: L.howToPlayText, font: DESIGN.fonts.body, size: DESIGN.sizes.body, color: DESIGN.colors.text })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: L.startText, font: DESIGN.fonts.body, size: DESIGN.sizes.body, italics: true, color: DESIGN.colors.textLight })] })
          ]
        })]
      })]
    }),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "▶  ", font: DESIGN.fonts.body, size: 28, color: DESIGN.colors.accent }), createClickableLink(1, L.clickToStart), new TextRun({ text: "  ◀", font: DESIGN.fonts.body, size: 28, color: DESIGN.colors.accent })] }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

function chapterHeader(title) {
  return [
    new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "✦", font: DESIGN.fonts.accent, size: 28, color: DESIGN.colors.accent })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: title.toUpperCase(), font: DESIGN.fonts.heading, size: DESIGN.sizes.chapterTitle, bold: true, characterSpacing: 60, color: DESIGN.colors.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "✦", font: DESIGN.fonts.accent, size: 28, color: DESIGN.colors.accent })] })
  ];
}

function paragraphBlock(para, lang) {
  const L = LABELS[lang];
  const elements = [];
  const bookmarkId = createBookmark(para.number);
  elements.push(new Paragraph({
    spacing: { before: DESIGN.spacing.sectionGap, after: 300 },
    children: [
      new TextRun({ text: "§ ", font: DESIGN.fonts.accent, size: DESIGN.sizes.paragraphNumber, color: DESIGN.colors.accent }),
      new Bookmark({ id: bookmarkId, children: [new TextRun({ text: String(para.number), font: DESIGN.fonts.display, size: DESIGN.sizes.paragraphNumber + 8, bold: true, color: DESIGN.colors.secondary })] })
    ]
  }));
  const textParts = para.text.split('\n\n');
  textParts.forEach((part, index) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: index === 0 ? 0 : DESIGN.spacing.paragraphBefore, after: DESIGN.spacing.paragraphAfter, line: DESIGN.spacing.lineHeight },
      indent: { firstLine: 400 },
      children: [new TextRun({ text: part.trim(), font: DESIGN.fonts.body, size: DESIGN.sizes.body, color: DESIGN.colors.text })]
    }));
  });
  if (para.choices && para.choices.length > 0) {
    elements.push(new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "Que faites-vous ?", font: DESIGN.fonts.body, size: DESIGN.sizes.body, italics: true, color: DESIGN.colors.textLight })] }));
    para.choices.forEach((choice) => {
      elements.push(new Paragraph({
        spacing: { before: DESIGN.spacing.choiceBefore, after: DESIGN.spacing.choiceAfter },
        indent: { left: 600 },
        children: [
          new TextRun({ text: "▸ ", font: DESIGN.fonts.body, size: DESIGN.sizes.choice, color: DESIGN.colors.accent }),
          new TextRun({ text: `${choice.text} → `, font: DESIGN.fonts.body, size: DESIGN.sizes.choice, color: DESIGN.colors.text }),
          createClickableLink(choice.target)
        ]
      }));
    });
  }
  if (para.isEnding) {
    elements.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: "─────────  ✦  ─────────", font: DESIGN.fonts.accent, size: DESIGN.sizes.decorative, color: DESIGN.colors.decorative })] }));
    elements.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 400 }, children: [new TextRun({ text: L.endText, font: DESIGN.fonts.display, size: 36, bold: true, italics: true, color: DESIGN.colors.secondary })] }));
  } else {
    elements.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "· · ·", font: DESIGN.fonts.accent, size: 24, color: DESIGN.colors.decorative })] }));
  }
  return elements;
}

function generateContent(config, paragraphs, lang) {
  const L = LABELS[lang];
  const content = [...coverPage(config, lang)];
  const sections = {};
  paragraphs.forEach(p => {
    if (!sections[p.section]) sections[p.section] = [];
    sections[p.section].push(p);
  });
  const sectionOrder = ['prologue', 'education', 'nature', 'economy', 'culture', 'experiences', 'daytrips', 'epilogue'];
  sectionOrder.forEach(sectionKey => {
    const sectionParagraphs = sections[sectionKey];
    if (sectionParagraphs && sectionParagraphs.length > 0) {
      const chapterName = L.chapters[sectionKey] || sectionKey;
      content.push(...chapterHeader(chapterName));
      sectionParagraphs.sort((a, b) => a.number - b.number);
      sectionParagraphs.forEach(para => content.push(...paragraphBlock(para, lang)));
    }
  });
  return content;
}

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "✦  ", font: DESIGN.fonts.accent, size: 14, color: DESIGN.colors.decorative }), new TextRun({ text: BOOK_CONFIG.title, font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, italics: true, color: DESIGN.colors.textLight }), new TextRun({ text: "  ✦", font: DESIGN.fonts.accent, size: 14, color: DESIGN.colors.decorative })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "─  ", font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, color: DESIGN.colors.decorative }), new TextRun({ children: [PageNumber.CURRENT], font: DESIGN.fonts.body, size: DESIGN.sizes.footer, bold: true, color: DESIGN.colors.textLight }), new TextRun({ text: "  ─", font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, color: DESIGN.colors.decorative })] })] }) },
    children: generateContent(BOOK_CONFIG, PARAGRAPHS, BOOK_CONFIG.language)
  }]
});

const outDir = path.dirname(BOOK_CONFIG.outputPath);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(BOOK_CONFIG.outputPath, buffer);
  console.log('Livre généré:', BOOK_CONFIG.outputPath);
  console.log('Paragraphes:', PARAGRAPHS.length);
}).catch(err => console.error('Erreur:', err));
