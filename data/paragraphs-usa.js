/**
 * Contenu des 100 paragraphes - USA 50 États
 * Section: prologue, northeast, south, midwest, mountain, pacific, reflection, epilogue
 */

module.exports = [
  // ═══ PROLOGUE (1-5) ═══
  {
    number: 1,
    section: "prologue",
    text: "Vous êtes à Bordeaux. Devant votre café, vous regardez passer les tramways et les façades blondes. Une idée germe depuis des mois : et si vous partiez vivre aux États-Unis ? Pas pour des vacances — pour vous installer. Mais avec cinquante États (et le district de Columbia), comment choisir ? Le coût de la vie, le climat, les communautés françaises, les opportunités professionnelles : tout change d’un État à l’autre. Vous décidez d’explorer méthodiquement, comme dans un livre dont vous êtes le héros. Par où commencer ?",
    choices: [
      { text: "Par le Nord-Est (New York, Boston, Nouvelle-Angleterre)", target: 6 },
      { text: "Par le Sud (Floride, Texas, Carolines…)", target: 6 },
      { text: "Par le Midwest (lacs, villes vivables, coût modéré)", target: 6 },
      { text: "Par les Rocheuses et le Sud-Ouest (nature, soleil)", target: 6 },
      { text: "Par la côte Pacifique (Californie, Seattle, Oregon)", target: 6 }
    ]
  },
  {
    number: 2,
    section: "prologue",
    text: "Vous ouvrez une carte des États-Unis. La taille du pays vous impressionne : Bordeaux–Paris tient en un rien à côté de la distance New York–Los Angeles. Vous pensez au climat : à Bordeaux vous avez des hivers doux et des étés chauds. Sur la côte Est, les hivers sont rudes ; dans le Sud, l’été peut être étouffant ; en Californie, le coût de la vie explose. Vous voulez explorer par grande région pour comparer.",
    choices: [
      { text: "Commencer par le Nord-Est", target: 7 },
      { text: "Commencer par le Sud", target: 17 },
      { text: "Commencer par le Midwest", target: 35 },
      { text: "Commencer par les Rocheuses / Sud-Ouest", target: 48 },
      { text: "Commencer par la côte Pacifique", target: 57 }
    ]
  },
  {
    number: 3,
    section: "prologue",
    text: "Vous listez ce qui compte pour vous : un endroit où il fait bon vivre, pas trop cher si possible, avec des opportunités de travail ou de télétravail, et idéalement un peu de lien avec la France (écoles, associations, resto). Les classements 2024–2025 placent en tête des États comme l’Utah, le New Hampshire, l’Idaho, le Minnesota, le Nebraska pour la qualité de vie ; Naples (Floride), Charlotte, Raleigh, Greenville pour les villes. Vous décidez de partir à la découverte.",
    choices: [
      { text: "Explorer le Nord-Est", target: 7 },
      { text: "Explorer le Sud", target: 17 },
      { text: "Explorer le Midwest", target: 35 },
      { text: "Explorer Rocheuses et Sud-Ouest", target: 48 },
      { text: "Explorer la côte Pacifique", target: 57 }
    ]
  },
  {
    number: 4,
    section: "prologue",
    text: "Un ami vous a dit : « Aux USA le logement et la santé coûtent bien plus cher qu’à Bordeaux. » C’est vrai en moyenne : les loyers et l’immobilier sont souvent plus élevés, et l’assurance santé est chère. Mais il y a de fortes disparités : le Midwest et le Sud sont en général plus abordables que la côte ouest ou Boston. Vous voulez voir État par État.",
    choices: [
      { text: "Nord-Est", target: 7 },
      { text: "Sud", target: 17 },
      { text: "Midwest", target: 35 },
      { text: "Rocheuses / Sud-Ouest", target: 48 },
      { text: "Pacifique", target: 57 }
    ]
  },
  {
    number: 5,
    section: "prologue",
    text: "Dernière chose avant de plonger : vous vous rappelez que les expatriés français sont nombreux à New York, Miami, San Francisco et Austin. Ces villes offrent des réseaux, des écoles bilingues parfois, et des communautés actives. Mais d’autres États moins médiatisés — comme le New Hampshire, le Colorado ou la Caroline du Nord — attirent aussi pour la qualité de vie. Vous êtes prêt à explorer.",
    choices: [
      { text: "Choisir une région et commencer", target: 6 }
    ]
  },
  {
    number: 6,
    section: "prologue",
    text: "Voici les cinq grandes régions des États-Unis que vous allez parcourir. Le Nord-Est : de la Nouvelle-Angleterre (Maine, Vermont, New Hampshire, Massachusetts, Rhode Island, Connecticut) à New York, New Jersey et Pennsylvanie. Le Sud : de la Virginie aux Carolines, la Géorgie, la Floride, le Kentucky, le Tennessee, l’Alabama, le Mississippi, la Louisiane, l’Arkansas, l’Oklahoma, le Texas (et le district de Columbia). Le Midwest : du Michigan à l’Ohio, l’Indiana, l’Illinois, le Wisconsin, le Minnesota, l’Iowa, le Missouri, le Kansas, le Nebraska, les Dakota. Les Rocheuses et le Sud-Ouest : Montana, Idaho, Wyoming, Colorado, Nouveau-Mexique, Arizona, Utah, Nevada. Enfin la côte Pacifique : Washington, Oregon, Californie, Alaska, Hawaï. Où allez-vous en premier ?",
    choices: [
      { text: "Nord-Est", target: 7 },
      { text: "Sud", target: 17 },
      { text: "Midwest", target: 35 },
      { text: "Rocheuses & Sud-Ouest", target: 48 },
      { text: "Pacifique", target: 57 }
    ]
  },

  // ═══ NORD-EST (7-16) ═══
  {
    number: 7,
    section: "northeast",
    text: "Vous posez le pied dans le Nord-Est : premières colonies, universités prestigieuses, hivers neigeux et feuilles d'automne. Portland (Maine) a été classée ville la plus vivable des USA en 2024 ; Manchester (New Hampshire) et Boston (Massachusetts) figurent en tête. Les saisons rythment tout : neige et ski l'hiver, érablières au printemps, plages et festivals l'été, feuillage flamboyant à l'automne. Les gens vivent entre nature et ville, pêche et tech. Coûts élevés à Boston et New York, plus raisonnables dans le Maine ou le New Hampshire.",
    choices: [
      { text: "Maine (Portland, Bangor)", target: 8 },
      { text: "Vermont (Burlington, nature)", target: 9 },
      { text: "New Hampshire (Manchester, pas d’impôt sur le revenu)", target: 10 },
      { text: "Massachusetts (Boston, Cambridge)", target: 11 },
      { text: "Rhode Island (Providence)", target: 12 },
      { text: "Connecticut (Hartford, Yale)", target: 13 },
      { text: "New York (NYC, Buffalo, Albany)", target: 14 },
      { text: "New Jersey (proche NYC, plages)", target: 15 },
      { text: "Pennsylvanie (Philadelphie, Pittsburgh)", target: 16 },
      { text: "Changer de région", target: 6 },
      { text: "Réflexion (coût de la vie, visas)", target: 63 }
    ]
  },
  {
    number: 8,
    section: "northeast",
    text: "MAINE — {{CONTRASTE}}À Bordeaux vous avez l'océan sans l'hiver ; ici vous avez les deux : neige jusqu'en mars, puis un été doux et des lacs partout.{{CHIFFRE}}Portland, ville la plus vivable des USA en 2024. Hiver -5 à -15 °C, été 20–28 °C ; Old Port, homard, bière artisanale, voiliers. Pêche, randonnée, ski, voile ; printemps = érablières, automne = feuillage et pommes.{{CONSEIL}}Bangor et Lewiston plus abordables. Peu de Français ; idéal si vous aimez la nature et une vie à taille humaine.",
    choices: [
      { text: "Vermont", target: 9 },
      { text: "New Hampshire", target: 10 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "J’ai trouvé mon coin", target: 98 }
    ]
  },
  {
    number: 9,
    section: "northeast",
    text: "VERMONT — {{CONTRASTE}}Vous cherchez l'air pur et la sécurité sans la foule : le Vermont est petit, vert, et classé premier pour la qualité de vie (CNBC).{{CHIFFRE}}Burlington sur le lac Champlain ; Stowe, Killington pour le ski. Hiver -10 à -20 °C, été 25–30 °C. Fromageries (Cabot), sugaring, marchés fermiers ; plein air toute l'année.{{CONSEIL}}Coût élevé mais cadre exceptionnel. Peu de Français ; pour qui privilégie nature, farm-to-table et calme.",
    choices: [
      { text: "New Hampshire", target: 10 },
      { text: "Massachusetts", target: 11 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "Fin explorateur", target: 98 }
    ]
  },
  {
    number: 10,
    section: "northeast",
    text: "NEW HAMPSHIRE — {{CONTRASTE}}Même proximité de Boston que le Vermont, mais sans impôt sur le revenu ni taxe de vente : les habitants ne manquent pas de le rappeler.{{CHIFFRE}}Manchester parmi les métropoles les plus vivables. White Mountains, lac Winnipesaukee à une heure. Hiver -5 à -15 °C (ski Loon, Bretton Woods), été 22–28 °C (voile, barbecues).{{CONSEIL}}Fiscalité légère et qualité de vie ; idéal si vous voulez nature et accès à l'emploi sans payer l'impôt sur le revenu.",
    choices: [
      { text: "Massachusetts", target: 11 },
      { text: "Maine", target: 8 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion", target: 63 }
    ]
  },
  {
    number: 11,
    section: "northeast",
    text: "MASSACHUSETTS — {{CONTRASTE}}Comme Bordeaux en « vieille ville » et culture, mais en plus froid l'hiver et bien plus cher : Boston et Cambridge enchaînent universités et biotech.{{CHIFFRE}}Harvard, MIT ; hiver -5 à -10 °C (Marathon en avril, TD Garden), été 25–32 °C (Cape Cod, North Shore). Red Sox, Celtics, Bruins ; communauté française présente.{{CONSEIL}}À considérer si le budget le permet ; coût très élevé, surtout le logement.",
    choices: [
      { text: "Rhode Island", target: 12 },
      { text: "New York", target: 14 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "Fin spécialiste", target: 99 }
    ]
  },
  {
    number: 12,
    section: "northeast",
    text: "RHODE ISLAND — {{CONTRASTE}}Le plus petit État : tout est proche, à échelle humaine, entre mer et villes — sans la démesure de NYC ou Boston.{{CHIFFRE}}Providence (Brown, RISD), Newport (villas Gilded Age, régates). Hiver 0–5 °C, été 18–28 °C ; voile, Newport Jazz, clam bakes. Week-ends faciles à Boston ou New York.{{CONSEIL}}Coût modéré pour la région ; vie bord de mer et arts, sans le stress des grandes métropoles.",
    choices: [
      { text: "Connecticut", target: 13 },
      { text: "Massachusetts", target: 11 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 13,
    section: "northeast",
    text: "CONNECTICUT — {{CONTRASTE}}Entre New York et Boston : vous gardez la ville à portée sans vivre dans le bruit, au prix d'une fiscalité élevée.{{CHIFFRE}}Hartford, New Haven (Yale) ; banlieues chères, bonnes écoles. Hiver froid, été doux ; voile Long Island Sound, golf, culture. Finance et assurance.{{CONSEIL}}Idéal si vous travaillez près de NYC et voulez écoles + calme ; prévoir un budget serré.",
    choices: [
      { text: "New York", target: 14 },
      { text: "New Jersey", target: 15 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 14,
    section: "northeast",
    text: "NEW YORK — {{CONTRASTE}}L'effervescence à l'américaine : tout est possible, tout est cher — et la communauté française est là pour vous accueillir.{{CHIFFRE}}NYC : Broadway, MoMA, Met ; hiver 0–5 °C, été 28–35 °C humide. Buffalo, Rochester, Albany moins chers, neige abondante. Les gens enchaînent boulot, sorties, brunchs, Hamptons.{{CONSEIL}}Référence pour carrière et culture ; au prix du stress et du budget. Pensez banlieue (New Jersey, Connecticut) si vous voulez respirer.",
    choices: [
      { text: "New Jersey", target: 15 },
      { text: "Pennsylvanie", target: 16 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion communauté française", target: 64 }
    ]
  },
  {
    number: 15,
    section: "northeast",
    text: "NEW JERSEY — {{CONTRASTE}}Beaucoup de Francophones travaillent à Manhattan et vivent ici : même dynamique pro, moins de folie et de loyer.{{CHIFFRE}}Montclair, Princeton, Jersey Shore. Hiver froid et neige, été plages et boardwalks (Atlantic City, Cape May). Navette train, vie de famille, diversité.{{CONSEIL}}Compromis ville / calme ; coût élevé mais moins que Manhattan. Bonnes écoles.",
    choices: [
      { text: "Pennsylvanie", target: 16 },
      { text: "New York", target: 14 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 16,
    section: "northeast",
    text: "PENNSYLVANIE — {{CONTRASTE}}Histoire et industrie reconvertie : Philadelphie côté Liberty Bell et musées, Pittsburgh côté tech et santé, sans les prix de NYC ou Boston.{{CHIFFRE}}Poconos pour le ski et les lacs. Hiver neige en montagne, été chaud. Eagles, Phillies, Steelers, Pirates ; campagne et culture.{{CONSEIL}}Bon rapport qualité-prix pour le Nord-Est ; à creuser si vous voulez ville vivante et coût maîtrisé.",
    choices: [
      { text: "Sud (Virginie, DC)", target: 17 },
      { text: "Retour Nord-Est", target: 7 },
      { text: "Autre région", target: 6 },
      { text: "Fin aventurier", target: 100 }
    ]
  },

  // ═══ SUD (17-34) ═══
  {
    number: 17,
    section: "south",
    text: "Vous passez dans le Sud : soleil, croissance démographique, coût souvent plus bas qu'au Nord-Est ou en Californie. Naples (Floride) et Greenville (Caroline du Sud) en tête des classements ; Charlotte, Raleigh, Johns Creek (Géorgie), Huntsville (Alabama), Fayetteville (Arkansas) très bien notés. Climat : hivers doux (sauf montagnes), étés chauds et humides ; les gens vivent dehors (plage, golf, barbecue), profitent du rythme sudiste. Vous explorez État par État (et DC).",
    choices: [
      { text: "Delaware", target: 18 },
      { text: "Maryland (Baltimore, DC proche)", target: 19 },
      { text: "Washington DC", target: 20 },
      { text: "Virginie (Richmond, Northern VA)", target: 21 },
      { text: "Virginie-Occidentale", target: 22 },
      { text: "Caroline du Nord (Charlotte, Raleigh)", target: 23 },
      { text: "Caroline du Sud (Greenville, Charleston)", target: 24 },
      { text: "Géorgie (Atlanta, Johns Creek)", target: 25 },
      { text: "Floride (Naples, Miami, Tampa)", target: 26 },
      { text: "Kentucky", target: 27 },
      { text: "Tennessee (Nashville, Memphis)", target: 28 },
      { text: "Alabama (Huntsville, Birmingham)", target: 29 },
      { text: "Mississippi", target: 30 },
      { text: "Louisiane (La Nouvelle-Orléans)", target: 31 },
      { text: "Arkansas (Fayetteville)", target: 32 },
      { text: "Oklahoma", target: 33 },
      { text: "Texas (Austin, Houston, Dallas)", target: 34 },
      { text: "Changer de région", target: 6 }
    ]
  },
  {
    number: 18,
    section: "south",
    text: "DELAWARE — {{CONTRASTE}}Petit État entre Philadelphie et l'océan : vous gardez la ville à portée sans la taxe de vente ni le bruit.{{CHIFFRE}}Pas de taxe de vente ; nombreuses sociétés incorporées. Wilmington ; Rehoboth, Dewey pour les plages. Hiver 0–5 °C, été 25–30 °C. Les gens travaillent à Philly ou en remote, plage le week-end.{{CONSEIL}}Coût modéré, fiscalité attractive ; idéal calme et plages sans quitter la région.",
    choices: [
      { text: "Maryland", target: 19 },
      { text: "DC", target: 20 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 19,
    section: "south",
    text: "MARYLAND — {{CONTRASTE}}Entre DC et Baltimore : emplois fédéraux et tech d'un côté, patrimoine et culture de l'autre, avec la baie en prime.{{CHIFFRE}}Bethesda, Silver Spring : écoles excellentes, chers. Baltimore plus abordable. Chesapeake à l'est. Hiver froid modéré, été 28–33 °C. Crab cakes, voile, musées.{{CONSEIL}}Environnement et éducation bien classés ; choisir banlieue DC (budget) ou Baltimore (coût + culture).",
    choices: [
      { text: "Washington DC", target: 20 },
      { text: "Virginie", target: 21 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 20,
    section: "south",
    text: "WASHINGTON DC — {{CONTRASTE}}Capitale du monde : si vous visez carrières internationales, diplomatie ou politique, c'est ici — au prix du coût de la vie.{{CHIFFRE}}Mall, monuments, Smithsonian gratuits. Hiver 0–5 °C, été 28–35 °C ; cerisiers au printemps. Communauté française forte. Les gens : réunions, networking, jogging au Mall, expos.{{CONSEIL}}Idéal carrières internationales ; budget serré. Pensez Virginie ou Maryland pour loger.",
    choices: [
      { text: "Virginie", target: 21 },
      { text: "Maryland", target: 19 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 21,
    section: "south",
    text: "VIRGINIE — {{CONTRASTE}}Vous voulez DC sans y vivre : Northern Virginia offre tech et gouvernement, Richmond l'histoire et un coût plus bas.{{CHIFFRE}}Arlington, Alexandria, Fairfax ; Richmond (capitale). Shenandoah, côte. Hiver doux à froid, été 25–32 °C. Randonnée, Colonial Williamsburg, Virginia Wine Country.{{CONSEIL}}Équilibre emploi / nature / histoire ; bonnes universités.",
    choices: [
      { text: "Caroline du Nord", target: 23 },
      { text: "Virginie-Occidentale", target: 22 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 22,
    section: "south",
    text: "VIRGINIE-OCCIDENTALE — {{CONTRASTE}}L'un des coûts de la vie les plus bas des USA, avec montagnes et forêts : idéal si le budget prime et que vous aimez l'outdoor.{{CHIFFRE}}Morgantown (université), Charleston (capitale). Hiver neige en altitude, été doux. Randonnée, VTT, chasse, pêche ; économie en transition (tourisme, télétravail).{{CONSEIL}}Idéal nature et budget limité ; peu de grandes villes.",
    choices: [
      { text: "Kentucky", target: 27 },
      { text: "Virginie", target: 21 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 23,
    section: "south",
    text: "CAROLINE DU NORD — {{CONTRASTE}}L'un des États les plus plébiscités pour la relocalisation : croissance, tech, santé, sans les prix de la côte ouest.{{CHIFFRE}}Charlotte (#5), Raleigh (#6) ; Asheville (montagnes), plages à l'est. Hiver 5–12 °C, été 28–33 °C. Hornets, NASCAR, barbecue, bière artisanale.{{CONSEIL}}Très populaire ; coût raisonnable. À mettre en tête de liste si vous visez Sud vivable.",
    choices: [
      { text: "Caroline du Sud", target: 24 },
      { text: "Géorgie", target: 25 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion coût de la vie", target: 63 }
    ]
  },
  {
    number: 24,
    section: "south",
    text: "CAROLINE DU SUD — {{CONTRASTE}}Greenville et Charleston incarnent le Sud qui bouge : qualité de vie, emploi, charme, sans (encore) les prix de la Floride.{{CHIFFRE}}Greenville (#4 national), Charleston (histoire, gastronomie). Climat subtropical : été 30–35 °C humide. Golf, plage, pêche, Spoleto.{{CONSEIL}}Coût encore abordable ; très attractif. À visiter si vous hésitez avec la Floride.",
    choices: [
      { text: "Géorgie", target: 25 },
      { text: "Floride", target: 26 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 25,
    section: "south",
    text: "GÉORGIE — {{CONTRASTE}}Johns Creek a été classée #1 ville USA (Niche 2025) : sécurité, qualité de vie, emploi — Atlanta à côté pour la culture et l'aéroport.{{CHIFFRE}}Atlanta : Coca-Cola, CNN. Savannah : charme historique. Hiver doux, été 28–34 °C. Braves, Falcons, musique, gastronomie sudiste.{{CONSEIL}}Coût en hausse à Atlanta ; Johns Creek et banlieues pour famille et calme.",
    choices: [
      { text: "Floride", target: 26 },
      { text: "Tennessee", target: 28 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 26,
    section: "south",
    text: "FLORIDE — {{CONTRASTE}}À Bordeaux l'hiver est doux ; ici il fait 18–25 °C en janvier et pas d'impôt sur le revenu — mais étés étouffants et ouragans.{{CHIFFRE}}Naples (#1), Sarasota, Tampa, Miami. Été 28–35 °C humide ; ouragans juin–nov. Communauté française en croissance (Brickell, Coral Gables). Plage, golf, bateau.{{CONSEIL}}Idéal soleil et dynamisme ; accepter climat et assurances chères. Miami pour les Français.",
    choices: [
      { text: "Louisiane", target: 31 },
      { text: "Caroline du Sud", target: 24 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion communauté française", target: 64 }
    ]
  },
  {
    number: 27,
    section: "south",
    text: "KENTUCKY — {{CONTRASTE}}Pas en tête des classements nationaux, mais un art de vivre à part : chevaux, bourbon, bluegrass, collines vertes.{{CHIFFRE}}Louisville (Kentucky Derby), Lexington (chevaux, université). Bourbon Trail. Hiver froid modéré, été 28–33 °C. UK Wildcats, Red River Gorge.{{CONSEIL}}Coût bas, cadre agréable ; pour qui cherche authenticité sudiste et nature.",
    choices: [
      { text: "Tennessee", target: 28 },
      { text: "Virginie-Occidentale", target: 22 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 28,
    section: "south",
    text: "TENNESSEE — {{CONTRASTE}}Nashville et Memphis attirent télétravailleurs et entreprises : musique, pas d'impôt sur le revenu, nature (Smokies) à côté.{{CHIFFRE}}Nashville (country, blues), Memphis (Elvis, barbecue). Knoxville, Chattanooga. Été 28–34 °C humide. Concerts, honky-tonks, Titans.{{CONSEIL}}Très attractif ; à considérer si vous voulez Sud vivant et fiscalité légère.",
    choices: [
      { text: "Alabama", target: 29 },
      { text: "Géorgie", target: 25 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 29,
    section: "south",
    text: "ALABAMA — {{CONTRASTE}}Huntsville est classée #7 national : la NASA et l'aérospatiale attirent ingénieurs et chercheurs, loin des clichés sur le Sud.{{CHIFFRE}}Huntsville, Hoover, Birmingham. Hiver doux, été 30–35 °C. Alabama Crimson Tide (obsession locale), barbecue, space industry.{{CONSEIL}}Coût bas, bon pour ingénierie et recherche ; accepter étés chauds et humides.",
    choices: [
      { text: "Mississippi", target: 30 },
      { text: "Tennessee", target: 28 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 30,
    section: "south",
    text: "MISSISSIPPI — {{CONTRASTE}}L'un des coûts de la vie les plus bas du pays, avec blues, histoire et Gulf Coast : pour qui le budget et le rythme comptent plus que la hype.{{CHIFFRE}}Natchez, Oxford (université). Hiver doux, été très chaud humide. Pêche, chasse, Delta blues, rythme lent.{{CONSEIL}}Idéal budget et calme ; économie plus fragile. À envisager si vous privilégiez coût et authenticité.",
    choices: [
      { text: "Louisiane", target: 31 },
      { text: "Alabama", target: 29 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 31,
    section: "south",
    text: "LOUISIANE — {{CONTRASTE}}La Nouvelle-Orléans et Lafayette : français, créole, jazz, gastronomie — une âme unique aux USA, malgré les ouragans.{{CHIFFRE}}French Quarter, Mardi Gras, bayous. Hiver doux, été 28–34 °C humide ; saison des ouragans. Musique live, cuisine, pêche.{{CONSEIL}}Pour qui aime l'âme et l'histoire ; coût modéré hors quartiers tendance. Accepter le risque climatique.",
    choices: [
      { text: "Texas", target: 34 },
      { text: "Arkansas", target: 32 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 32,
    section: "south",
    text: "ARKANSAS — {{CONTRASTE}}Fayetteville classée #21 national : université, Ozarks, coût très bas — le plein air sans se ruiner.{{CHIFFRE}}Fayetteville, Little Rock. Hiver doux à froid, été 28–33 °C. Randonnée, VTT, pêche, Razorbacks. Vie à l'extérieur.{{CONSEIL}}Idéal nature et budget serré ; croissance modérée.",
    choices: [
      { text: "Oklahoma", target: 33 },
      { text: "Tennessee", target: 28 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 33,
    section: "south",
    text: "OKLAHOMA — {{CONTRASTE}}Plaines, espace, énergie (pétrole, gaz) : un coût de la vie bas et une vie au grand air pour qui ne craint pas l'été chaud.{{CHIFFRE}}Oklahoma City, Tulsa. Hiver variable, été 32–38 °C, orages. Thunder (NBA), rodéos, country. Télétravail, espace.{{CONSEIL}}Coût bas ; bon si vous voulez du space et un budget maîtrisé.",
    choices: [
      { text: "Texas", target: 34 },
      { text: "Arkansas", target: 32 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 34,
    section: "south",
    text: "TEXAS — {{CONTRASTE}}Pas d'impôt sur le revenu, opportunités et « keep Austin weird » : les expats français s'y installent de plus en plus.{{CHIFFRE}}Austin (tech, musique), Houston (énergie, médecine), Dallas–Fort Worth, San Antonio. Été torride 35–40 °C. Barbecue, Cowboys, Texans, rodéo. Communauté française à Austin.{{CONSEIL}}Coût en hausse mais compétitif ; idéal si vous visez Sud dynamique et fiscalité légère.",
    choices: [
      { text: "Nouveau-Mexique (Sud-Ouest)", target: 53 },
      { text: "Retour Sud", target: 17 },
      { text: "Autre région", target: 6 },
      { text: "J’ai trouvé", target: 98 }
    ]
  },

  // ═══ MIDWEST (35-47) ═══
  {
    number: 35,
    section: "midwest",
    text: "Vous entrez dans le Midwest : lacs, plaines, villes souvent en tête pour qualité de vie et coût. Green Bay et Madison (Wisconsin), Carmel et Fort Wayne (Indiana), Ann Arbor (Michigan), Naperville (Illinois), Omaha (Nebraska), Minneapolis–Saint Paul (Minnesota). Hivers froids et neigeux, étés chauds ; les gens vivent pour le sport (football, hockey, baseball), les lacs, la vie de famille et la communauté. « Livability » au centre.",
    choices: [
      { text: "Michigan (Ann Arbor, Détroit)", target: 36 },
      { text: "Ohio (Columbus, Cleveland, Cincinnati)", target: 37 },
      { text: "Indiana (Carmel, Indianapolis)", target: 38 },
      { text: "Illinois (Chicago, Naperville)", target: 39 },
      { text: "Wisconsin (Madison, Green Bay)", target: 40 },
      { text: "Minnesota (Minneapolis, Rochester)", target: 41 },
      { text: "Iowa (Des Moines)", target: 42 },
      { text: "Missouri (Kansas City, Saint Louis)", target: 43 },
      { text: "Kansas (Kansas City area)", target: 44 },
      { text: "Nebraska (Omaha, Lincoln)", target: 45 },
      { text: "Dakota du Sud", target: 46 },
      { text: "Dakota du Nord", target: 47 },
      { text: "Changer de région", target: 6 }
    ]
  },
  {
    number: 36,
    section: "midwest",
    text: "MICHIGAN — {{CONTRASTE}}Ann Arbor classée #19 : université, tech, santé ; Détroit en renaissance. Les Grands Lacs changent tout — voile, plages, hiver neigeux.{{CHIFFRE}}Hiver -10 à -5 °C, été 22–28 °C. Red Wings, Lions, Wolverines ; voile sur les lacs, randonnée. Coût modéré.{{CONSEIL}}Idéal éducation et industrie ; accepter hivers rudes.",
    choices: [
      { text: "Ohio", target: 37 },
      { text: "Indiana", target: 38 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 37,
    section: "midwest",
    text: "OHIO — {{CONTRASTE}}Columbus, Cleveland, Cincinnati : un État pivot, bon équilibre emploi / coût, sans les extrêmes du Nord-Est ou du Sud profond.{{CHIFFRE}}Hiver froid neigeux, été 25–30 °C. Browns, Bengals, Buckeyes ; musées Cleveland, parcs, vie de famille. Coût raisonnable.{{CONSEIL}}Bon compromis ; à considérer si vous voulez ville vivante et budget maîtrisé.",
    choices: [
      { text: "Indiana", target: 38 },
      { text: "Kentucky (Sud)", target: 27 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 38,
    section: "midwest",
    text: "INDIANA — {{CONTRASTE}}Carmel classée #1 (Niche), Fort Wayne #20 : écoles primées, sécurité, immobilier abordable — l'Amérique « middle » qui fonctionne.{{CHIFFRE}}Indianapolis ; Indy 500 en mai (folie locale). Hiver froid, été 25–30 °C. Pacers, Colts, sport universitaire, vie de banlieue.{{CONSEIL}}Très bon rapport qualité-prix ; idéal famille et stabilité.",
    choices: [
      { text: "Illinois", target: 39 },
      { text: "Ohio", target: 37 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 39,
    section: "midwest",
    text: "ILLINOIS — {{CONTRASTE}}Chicago : la grande ville sans les côtes — finance, tech, culture, mais hiver rude et fiscalité lourde.{{CHIFFRE}}Naperville, Rogers Park très bien notés. Hiver -5 à -15 °C, vent ; été 25–32 °C. Cubs, White Sox, Bulls, Bears ; musées, théâtre.{{CONSEIL}}Pour qui veut la métropole ; coût élevé à Chicago, plus bas en banlieue.",
    choices: [
      { text: "Wisconsin", target: 40 },
      { text: "Missouri", target: 43 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 40,
    section: "midwest",
    text: "WISCONSIN — {{CONTRASTE}}Green Bay (#12) et Madison (#14) : les Packers sont une religion, les lacs et le fromage une façon de vivre.{{CHIFFRE}}Hiver -10 °C, été 22–28 °C. Santé, IT, fabrication. Bratwurst, fromage, voile, pêche sur glace, tailgate. Coût modéré.{{CONSEIL}}Très bon pour famille et nature ; accepter hivers froids.",
    choices: [
      { text: "Minnesota", target: 41 },
      { text: "Iowa", target: 42 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 41,
    section: "midwest",
    text: "MINNESOTA — {{CONTRASTE}}Classé #4 meilleur État : « Land of 10,000 Lakes », Mayo Clinic, Fortune 500 — mais des hivers à -25 °C.{{CHIFFRE}}Minneapolis–Saint Paul, Rochester. Hiver -15 à -25 °C, été 22–28 °C. Hockey (Wild), ski de fond, pêche, Vikings. Les gens vivent dehors malgré le froid.{{CONSEIL}}Éducation et santé au top ; idéal si vous assumez l'hiver.",
    choices: [
      { text: "Iowa", target: 42 },
      { text: "Wisconsin", target: 40 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion santé / éducation", target: 65 }
    ]
  },
  {
    number: 42,
    section: "midwest",
    text: "IOWA — {{CONTRASTE}}Des Moines : assurance, finance, coût bas. L'État qui lance les primaires présidentielles tous les 4 ans — calme et central.{{CHIFFRE}}Hiver froid, été 25–30 °C. Agriculture, RAGBRAI (cyclisme), petites villes sûres, écoles solides.{{CONSEIL}}Idéal calme, nature et budget ; peu de grandes villes.",
    choices: [
      { text: "Missouri", target: 43 },
      { text: "Nebraska", target: 45 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 43,
    section: "midwest",
    text: "MISSOURI — {{CONTRASTE}}Kansas City (barbecue, jazz) et Saint Louis (Gateway Arch, Cardinals) : centralité géographique, coût bas.{{CHIFFRE}}Hiver froid modéré, été 28–33 °C humide. BBQ, musique, sport, famille. Croissance à KC.{{CONSEIL}}Bon pour télétravail et famille ; coût bas.",
    choices: [
      { text: "Kansas", target: 44 },
      { text: "Arkansas (Sud)", target: 32 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 44,
    section: "midwest",
    text: "KANSAS — {{CONTRASTE}}L'un des coûts de la vie les plus bas des USA : plaines, espace, Chiefs à Kansas City si vous aimez le foot US.{{CHIFFRE}}Kansas City (côté KS), Wichita. Hiver froid, été 30–35 °C, orages. Agriculture, vie calme.{{CONSEIL}}Idéal budget et espace ; accepter étés chauds.",
    choices: [
      { text: "Nebraska", target: 45 },
      { text: "Missouri", target: 43 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 45,
    section: "midwest",
    text: "NEBRASKA — {{CONTRASTE}}Classé #5 État : Omaha (Warren Buffett, Berkshire), Lincoln. Sûr, stable, passion Cornhuskers.{{CHIFFRE}}Hiver froid, été 28–33 °C. Agriculture, assurance, tech. Football d'État, calme.{{CONSEIL}}Idéal stabilité et coût modéré ; peu de relief.",
    choices: [
      { text: "Dakota du Sud", target: 46 },
      { text: "Iowa", target: 42 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 46,
    section: "midwest",
    text: "DAKOTA DU SUD — {{CONTRASTE}}Badlands, Black Hills, Mount Rushmore, pas d'impôt sur le revenu : nature et fiscalité pour qui aime l'espace.{{CHIFFRE}}Sioux Falls, Rapid City. Hiver -15 °C, été 25–30 °C. Sturgis (moto), randonnée, chasse, pêche. Très peu peuplé.{{CONSEIL}}Idéal nature et fiscalité ; isolement assumé.",
    choices: [
      { text: "Dakota du Nord", target: 47 },
      { text: "Wyoming (Rocheuses)", target: 51 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 47,
    section: "midwest",
    text: "DAKOTA DU NORD — {{CONTRASTE}}Fargo, Bismarck : pétrole, agriculture, hivers extrêmes. Pour qui cherche l'espace et l'économie rurale.{{CHIFFRE}}Hiver -20 °C, été court 22–28 °C. Chasse, pêche, peu de monde.{{CONSEIL}}Pour qui cherche l'espace ; accepter climat et isolement.",
    choices: [
      { text: "Montana (Rocheuses)", target: 49 },
      { text: "Minnesota", target: 41 },
      { text: "Retour Midwest", target: 35 },
      { text: "Autre région", target: 6 }
    ]
  },

  // ═══ ROCHEUSES & SUD-OUEST (48-56) ═══
  {
    number: 48,
    section: "mountain",
    text: "Rocheuses et Sud-Ouest : Utah (#1 État), Idaho (#3), Colorado, Arizona, Nouveau-Mexique, Nevada, Montana, Wyoming. Nature spectaculaire, ensoleillement, ski et randonnée. Climat contrasté : neige en montagne l'hiver, étés secs et chauds (désert torride en Arizona/Nevada). Les gens skient, randonnent, font du VTT, vivent dehors. Coût variable : Denver et Salt Lake en hausse ; Idaho et Arizona encore abordables.",
    choices: [
      { text: "Montana", target: 49 },
      { text: "Idaho (Boise, Sun Valley)", target: 50 },
      { text: "Wyoming", target: 51 },
      { text: "Colorado (Denver, Boulder)", target: 52 },
      { text: "Nouveau-Mexique (Santa Fe, Albuquerque)", target: 53 },
      { text: "Arizona (Phoenix, Tucson)", target: 54 },
      { text: "Utah (Salt Lake City, Park City)", target: 55 },
      { text: "Nevada (Las Vegas, Reno)", target: 56 },
      { text: "Changer de région", target: 6 }
    ]
  },
  {
    number: 49,
    section: "mountain",
    text: "MONTANA — {{CONTRASTE}}Yellowstone au sud, Glacier Park, « Big Sky » : grands espaces et nature intacte, de plus en plus prisés des télétravailleurs.{{CHIFFRE}}Bozeman, Missoula ; universités, télétravail. Hiver -15 à -5 °C neigeux, été sec 25–30 °C. Ski, randonnée, pêche (truite), chasse, VTT. Coût en hausse.{{CONSEIL}}Pour amoureux de la nature et du calme ; accepter hivers longs.",
    choices: [
      { text: "Idaho", target: 50 },
      { text: "Wyoming", target: 51 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 50,
    section: "mountain",
    text: "IDAHO — {{CONTRASTE}}Classé #3 État : Boise et Sun Valley attirent sans (encore) les prix du Colorado ou de la Californie.{{CHIFFRE}}Croissance, tech, ski. Hiver -5 à -10 °C, été sec 28–33 °C. Pommes de terre, nature. Ski, rafting, randonnée, vélo. Coût encore abordable.{{CONSEIL}}Très populaire pour la relocalisation ; à mettre en short-list.",
    choices: [
      { text: "Utah", target: 55 },
      { text: "Washington (Pacifique)", target: 58 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 51,
    section: "mountain",
    text: "WYOMING — {{CONTRASTE}}Le moins peuplé des États : Yellowstone, Grand Teton, pas d'impôt sur le revenu. Aventure et fiscalité.{{CHIFFRE}}Cheyenne, Jackson Hole (cher). Hiver -15 °C, été 22–28 °C en altitude. Randonnée, pêche, ski, rodéo. Isolement.{{CONSEIL}}Pour l'aventure et la fiscalité ; Jackson Hole pour le standing, ailleurs pour l'espace.",
    choices: [
      { text: "Colorado", target: 52 },
      { text: "Montana", target: 49 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 52,
    section: "mountain",
    text: "COLORADO — {{CONTRASTE}}Denver et Boulder : 300 jours de soleil, tech, outdoor. Sundance s'y installe en 2027. Le rêve montagne, au prix du coût.{{CHIFFRE}}Fort Collins, Colorado Springs. Hiver neigeux en montagne, doux à Denver ; été sec 28–33 °C. Ski, randonnée, vélo, Broncos, bière. Coût élevé Denver/Boulder.{{CONSEIL}}Idéal outdoor et tech ; prévoir un budget confortable.",
    choices: [
      { text: "Utah", target: 55 },
      { text: "Nouveau-Mexique", target: 53 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 53,
    section: "mountain",
    text: "NOUVEAU-MEXIQUE — {{CONTRASTE}}Santa Fe et Albuquerque : art, adobe, culture hispanique et amérindienne — un Sud-Ouest à part.{{CHIFFRE}}Altitude adoucit le climat. Hiver doux, été 28–35 °C sec. Galeries, green chile, randonnée, ski (Taos). Coût raisonnable.{{CONSEIL}}Pour qui aime art, culture et nature ; coût maîtrisé.",
    choices: [
      { text: "Arizona", target: 54 },
      { text: "Texas (Sud)", target: 34 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 54,
    section: "mountain",
    text: "ARIZONA — {{CONTRASTE}}Phoenix explose en été (40+ °C) ; l'hiver est doux (15–22 °C). Pas d'impôt sur les plus-values sous conditions. Retraités et télétravailleurs.{{CHIFFRE}}Tucson plus verte, Sedona (paysages). Golf, piscine, randonnée tôt le matin. Croissance forte.{{CONSEIL}}Idéal si vous supportez l'été désertique ; hiver parfait.",
    choices: [
      { text: "Utah", target: 55 },
      { text: "Nevada", target: 56 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 55,
    section: "mountain",
    text: "UTAH — {{CONTRASTE}}Classé #1 État (U.S. News) : Salt Lake City, Park City, Sundance (jusqu'en 2027). Stabilité, familles, nature.{{CHIFFRE}}Olympiades, tech, Mormons. Arches, canyons. Hiver neigeux, été 30–35 °C sec. Ski, randonnée, VTT. Croissance rapide, coût en hausse.{{CONSEIL}}Top qualité de vie ; accepter culture mormone dominante.",
    choices: [
      { text: "Nevada", target: 56 },
      { text: "Colorado", target: 52 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 56,
    section: "mountain",
    text: "NEVADA — {{CONTRASTE}}Las Vegas : divertissement et pas d'impôt sur le revenu. Reno plus petit, proche du lac Tahoe (ski, voile).{{CHIFFRE}}Désert : hiver doux, été 35–40 °C. Casinos, shows, golf, télétravail. Coût variable (Vegas abordable hors Strip).{{CONSEIL}}Pour le soleil et la fiscalité ; Tahoe pour la nature.",
    choices: [
      { text: "Californie (Pacifique)", target: 60 },
      { text: "Arizona", target: 54 },
      { text: "Retour Rocheuses", target: 48 },
      { text: "Autre région", target: 6 }
    ]
  },

  // ═══ PACIFIQUE (57-62) ═══
  {
    number: 57,
    section: "pacific",
    text: "Côte Pacifique : Washington, Oregon, Californie, Alaska, Hawaï. Qualité de vie et paysages exceptionnels ; coût très élevé en Californie et grandes villes. Seattle, Portland, San Francisco, San Diego, Honolulu. Climat : nord pluvieux et doux, Californie tempérée, Hawaï tropical. Les gens : tech, outdoor (randonnée, surf, ski), culture ; communauté française à SF et LA.",
    choices: [
      { text: "Washington (Seattle)", target: 58 },
      { text: "Oregon (Portland, Eugene)", target: 59 },
      { text: "Californie (SF, LA, San Diego)", target: 60 },
      { text: "Alaska (Anchorage)", target: 61 },
      { text: "Hawaï (Honolulu)", target: 62 },
      { text: "Changer de région", target: 6 }
    ]
  },
  {
    number: 58,
    section: "pacific",
    text: "WASHINGTON — {{CONTRASTE}}Seattle : Amazon, Microsoft, café, pluie. Pas d'impôt sur le revenu. Comme une Portland en plus grande et plus chère.{{CHIFFRE}}Hiver 5–10 °C pluvieux, été 20–25 °C sec et magnifique. Cascades, Olympic ; randonnée, kayak, tech, musique. Coût élevé. État progressiste.{{CONSEIL}}Idéal tech et outdoor ; accepter la pluie et le coût.",
    choices: [
      { text: "Oregon", target: 59 },
      { text: "Idaho (Rocheuses)", target: 50 },
      { text: "Retour Pacifique", target: 57 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 59,
    section: "pacific",
    text: "OREGON — {{CONTRASTE}}Portland : hipster, vert, pas de taxe de vente. Moins cher que la Californie, même esprit décontracté et outdoor.{{CHIFFRE}}Eugene, Salem ; côte sauvage. Hiver 5–10 °C pluvieux, été 20–28 °C sec. Vélo, bière artisanale, randonnée. Coût en hausse.{{CONSEIL}}Bon compromis Pacifique ; moins que Seattle ou la Californie.",
    choices: [
      { text: "Californie", target: 60 },
      { text: "Washington", target: 58 },
      { text: "Retour Pacifique", target: 57 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 60,
    section: "pacific",
    text: "CALIFORNIE — {{CONTRASTE}}État le plus peuplé : SF (tech, français), LA (cinéma), San Diego (climat doux). Opportunités et communauté française — au prix d'un coût parmi les plus élevés (indice ~145).{{CHIFFRE}}Côte tempérée 15–25 °C ; intérieur et sud étés 30–38 °C. Plage, randonnée, culture, carrière.{{CONSEIL}}À considérer si le salaire suit ; penser banlieue ou villes secondaires pour le budget.",
    choices: [
      { text: "Hawaï", target: 62 },
      { text: "Nevada (proche)", target: 56 },
      { text: "Retour Pacifique", target: 57 },
      { text: "Autre région", target: 6 },
      { text: "Réflexion communauté française", target: 64 }
    ]
  },
  {
    number: 61,
    section: "pacific",
    text: "ALASKA — {{CONTRASTE}}Glaciers, aurores boréales, pas d'impôt sur le revenu, dividende annuel pour résidents : l’aventure et la fiscalité, dans l’isolement.{{CHIFFRE}}Anchorage, Juneau. Hiver -20 à -10 °C, nuit polaire ; été court 15–22 °C, jour permanent. Pêche, randonnée, ski, chasse. Coût élevé (transport, chauffage).{{CONSEIL}}Pour l'aventure et l'isolement ; assumer climat et coût.",
    choices: [
      { text: "Washington", target: 58 },
      { text: "Retour Pacifique", target: 57 },
      { text: "Autre région", target: 6 }
    ]
  },
  {
    number: 62,
    section: "pacific",
    text: "HAWAÏ — {{CONTRASTE}}Paradis tropical 25–30 °C toute l'année : surf, plongée, culture polynésienne. Le rêve a un prix — coût de la vie très élevé.{{CHIFFRE}}Honolulu, Maui. Alizés ; saison des pluies nov.–mars. Tourisme, militaire. Vie outdoor.{{CONSEIL}}Idéal télétravail ou emploi local bien payé ; sinon budget serré.",
    choices: [
      { text: "Californie", target: 60 },
      { text: "Retour Pacifique", target: 57 },
      { text: "Autre région", target: 6 },
      { text: "J’ai trouvé", target: 98 }
    ]
  },

  // ═══ RÉFLEXIONS (63-70) ═══
  {
    number: 63,
    section: "reflection",
    text: "Vous faites une pause. Coût de la vie : en moyenne les USA sont environ 38 % plus chers que Bordeaux (logement +105 %, santé bien plus chère). Mais le Midwest et le Sud (Kansas, Mississippi, Virginie-Occidentale, Oklahoma…) sont beaucoup moins chers que la Californie ou New York. Pensez budget logement et assurance santé avant de fixer votre choix.",
    choices: [
      { text: "Explorer à nouveau par région", target: 6 },
      { text: "J’ai une short-list (fin explorateur)", target: 98 },
      { text: "Je creuse une région (fin spécialiste)", target: 99 }
    ]
  },
  {
    number: 64,
    section: "reflection",
    text: "Communauté française : New York, Miami, San Francisco et Austin ont les plus grosses concentrations d’expatriés français (écoles, restos, associations). Boston, Washington DC, Chicago et Los Angeles en ont aussi. Dans les autres États, vous serez plus isolé mais souvent bien accueilli. Réseaux LinkedIn et Facebook « Français à [ville] » utiles.",
    choices: [
      { text: "Retour aux régions", target: 6 },
      { text: "J’ai trouvé (fin explorateur)", target: 98 },
      { text: "Fin aventurier", target: 100 }
    ]
  },
  {
    number: 65,
    section: "reflection",
    text: "Visas et démarches : pour travailler aux USA il faut généralement un visa (H-1B, L-1, O-1, E-2 selon profil). La green card est longue à obtenir. Beaucoup de Français y vont en transfert d’entreprise (L-1) ou en créant une structure (E-2). Consulter un avocat en immigration. Les États ne changent pas les règles fédérales, mais certains (Texas, Floride, Nevada…) attirent par l’absence d’impôt sur le revenu une fois résident.",
    choices: [
      { text: "Explorer à nouveau", target: 6 },
      { text: "Fin spécialiste", target: 99 }
    ]
  },
  {
    number: 66,
    section: "reflection",
    text: "Climat : à Bordeaux vous avez des hivers doux. Dans le Nord-Est et le Midwest, les hivers sont rudes (neige, -10 °C voire moins). Le Sud et la Floride : étés très chauds et humides. La côte californienne et le Pacifique nord : climat tempéré. Arizona/Nevada : désert, étés torrides. Pensez à ce que vous supportez vraiment.",
    choices: [
      { text: "Nord-Est", target: 7 },
      { text: "Sud", target: 17 },
      { text: "Pacifique", target: 57 },
      { text: "Fin", target: 98 }
    ]
  },
  {
    number: 67,
    section: "reflection",
    text: "Santé et assurance : aux USA l’assurance maladie est chère et souvent liée à l’emploi. Sans emploi, il faut souscrire soi-même (Obamacare ou privé). Les meilleurs hôpitaux et la recherche sont au top (Mayo Clinic, Cleveland, Boston), mais l’accès dépend de votre couverture. Les États du Nord-Est et du Midwest sont souvent mieux notés pour l’accès aux soins.",
    choices: [
      { text: "Midwest (Minnesota, etc.)", target: 35 },
      { text: "Nord-Est", target: 7 },
      { text: "Retour régions", target: 6 }
    ]
  },
  {
    number: 68,
    section: "reflection",
    text: "Nature et plein air : si vous voulez randonnée, ski, lacs et parcs, les Rocheuses (Utah, Colorado, Idaho, Montana), le Pacifique (Washington, Oregon, Californie) et le Nord-Est (Vermont, New Hampshire, Maine) sont imbattables. Le Sud offre plages et bayous ; le Midwest, lacs et plaines. Choisir selon votre style.",
    choices: [
      { text: "Rocheuses", target: 48 },
      { text: "Pacifique", target: 57 },
      { text: "Nord-Est", target: 7 },
      { text: "Fin aventurier", target: 100 }
    ]
  },
  {
    number: 69,
    section: "reflection",
    text: "Villes vs campagne : les grandes métropoles (NYC, LA, Chicago, Houston, Boston) offrent emploi, culture et communauté française, au prix du coût et du stress. Les petites villes et les banlieues (Portland ME, Greenville SC, Carmel IN, Boise) offrent qualité de vie et coût maîtrisé, avec moins d’effervescence. Beaucoup d’Américains (et d’expatriés) choisissent désormais des villes moyennes en télétravail.",
    choices: [
      { text: "Explorer les régions", target: 6 },
      { text: "Fin explorateur", target: 98 }
    ]
  },
  {
    number: 70,
    section: "reflection",
    text: "Comparatif Bordeaux : vous quittez une ville à taille humaine, un climat doux, une gastronomie et un système de santé accessibles. Aux USA vous gagnerez en diversité de paysages et d’opportunités, en salaires souvent plus élevés (dans les bons secteurs), mais vous paierez plus pour le logement et la santé. Le choix dépend de ce que vous maximisez : carrière, nature, communauté française, budget, climat.",
    choices: [
      { text: "Continuer l’exploration", target: 6 },
      { text: "Conclure (explorateur)", target: 98 },
      { text: "Conclure (spécialiste)", target: 99 },
      { text: "Conclure (aventurier)", target: 100 }
    ]
  },

  // ═══ ÉPILOGUES (98-100) ═══
  {
    number: 98,
    section: "epilogue",
    text: "Vous avez parcouru plusieurs régions et états. Vous avez une short-list : des noms de villes et d’états qui vous parlent, où le coût, le climat, les opportunités ou la communauté française correspondent à ce que vous cherchez. Prochaine étape : approfondir (séjours sur place, recherches emploi et visa), puis prendre la décision. Bonne chance pour la suite — de Bordeaux aux USA, l’aventure ne fait que commencer.",
    choices: [],
    isEnding: true,
    endingType: "explorer"
  },
  {
    number: 99,
    section: "epilogue",
    text: "Une région vous a particulièrement marqué : Nord-Est, Sud, Midwest, Rocheuses ou Pacifique. Vous voulez creuser cette piste : visiter, comparer les villes, regarder les offres d’emploi et les quartiers. En se concentrant sur une seule région, vous pourrez affiner jusqu’à l’état et la ville qui vous conviennent. Bravo pour cette première conviction.",
    choices: [],
    isEnding: true,
    endingType: "specialist"
  },
  {
    number: 100,
    section: "epilogue",
    text: "Vous préférez garder l’esprit ouvert : pas une seule destination, mais plusieurs possibles selon les opportunités (visa, offre d’emploi, télétravail). Vous continuerez à explorer au gré des occasions. C’est une façon tout aussi valable de se rapprocher des USA — en aventurier.",
    choices: [],
    isEnding: true,
    endingType: "adventurer"
  }
];
