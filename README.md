# USA Interactive Map & Travel Guide

Carte interactive des **50 États US + Washington DC** avec données socio-économiques et guide « dont vous êtes le héros » pour explorer les meilleurs endroits où vivre.

## Structure du projet

```
/
├── public/                  # Racine du serveur (npm start)
│   ├── usa-map.html        # Carte interactive (source principale)
│   ├── usa-states.svg      # Carte SVG des États
│   └── app-data.json       # Données fusionnées (généré par npm run build)
│
├── map-data/                # Données sources carte (scripts lisent/écrivent ici)
│   ├── state-map.json      # États, villes, Livability, classements
│   ├── city-coordinates.json
│   ├── venues-map.json     # SX/VTT/BMX/MX/Ski
│   ├── airports.json
│   ├── livability-details.json
│   ├── tracks-by-state.json
│   └── html-pages/         # Pages HTML scrapées (Livability)
│
├── book/                    # Livre généré (DOCX + PDF)
│   ├── Livre_Heros_USA_50_Etats.docx
│   └── Livre_Heros_USA_50_Etats.pdf
│
├── data/                    # Données sources livre (enrichissement)
│   ├── paragraphs-usa.js
│   ├── state-codes.js
│   ├── state-cities.js
│   ├── state-urls.js
│   ├── state-french-data.js
│   └── criteria-data.js
│
├── scripts/
│   ├── merge-json.js             # Fusionne map-data/*.json → public/app-data.json
│   ├── generate-travel-hero-usa.js  # Génère le livre DOCX (app-data + paragraphs-usa)
│   ├── docx-to-pdf.py            # Convertit le DOCX en PDF (docx2pdf + Word)
│   ├── scrape-livability-cities.js
│   ├── compute-airport-distances.js
│   └── extract-livability-details.js
│
├── package.json
├── launch-site.bat
└── .gitignore
```

## Carte interactive

La carte `usa-map.html` affiche :
- **50 États + DC** avec panneau détaillé (climat, coût, fiscalité, classements)
- **Top 25 villes** (marqueurs cœur) avec liens Livability.com
- **Villes principales** avec données Quick Facts (revenu, immobilier, loyer, météo)
- **Venues sportives** (SX/SMX, VTT, BMX)

### Lancer l'application

```powershell
npm start
# ou
npx serve public
```

Puis ouvrir [http://localhost:3000/usa-map.html](http://localhost:3000/usa-map.html) (le serveur a pour racine le dossier `public/`).

> Sous Windows : double-cliquer `launch-site.bat`

### Carte Lyon (métropole : Actu + CityCrunch)

Les points et scores viennent de `map-data/lyon-zones.json`. Après toute édition manuelle des noms ou des scores, regéocodez les coordonnées (Nominatim, ~1 requête/s, User-Agent identifié) puis publiez le JSON côté `public/` :

```powershell
$env:NOMINATIM_UA="usa-interactive-map/2.0 (Lyon zones; local dev)"
# optionnel (recommandé) : $env:NOMINATIM_EMAIL="contact@exemple.com"
npm run geocode:lyon
npm run fetch:lyon-dvf
npm run build:lyon
# optionnel : heatmap DVF (€/m²) — génère `public/lyon-dvf-heatmap.json` (télécharge les CSV DVF 69)
npm run build:lyon-dvf-heat
```

Puis lancer le site et ouvrir [http://localhost:3000/lyon-map.html](http://localhost:3000/lyon-map.html) (fichier `public/lyon-map.html`, données `public/lyon-data.json` générées par `build:lyon` ; calque heatmap DVF : `lyon-dvf-heatmap.json` — **médianes** €/m² par case, avec filtre **T4, T5+** (≥4 pièces DVF) dans l’UI).

### Carte Bordeaux (métropole : Actu + Lacartedescolocs)

Les points et scores viennent de `map-data/bordeaux-zones.json`. Après édition (quartiers / communes), regéocodez puis publiez les JSON côté `public/` :

```powershell
$env:NOMINATIM_UA="usa-interactive-map/2.0 (Bordeaux zones; local dev)"
# optionnel (recommandé) : $env:NOMINATIM_EMAIL="contact@exemple.com"
npm run geocode:bordeaux
npm run fetch:bordeaux-dvf
npm run build:bordeaux
npm run build:bordeaux-dvf-heat
npm run build:bordeaux-map
# (optionnel) isochrones OSRM : peut être long
npm run build:bordeaux-iso
```

Puis lancer le site et ouvrir [http://localhost:3000/bordeaux-map.html](http://localhost:3000/bordeaux-map.html).

**Circuits motocross (Lyon & Bordeaux, calque MX)** : les points viennent d’OSM (Overpass) + complément [MXC40](https://www.mxc40.com/) (Gironde 33, Rhône 69) fusionné dans `app-data-fr.json`. Mise à jour : `npm run fetch:mxc40-mx` puis `npm run build:fr` (déjà inclus dans `npm run refresh:fr-venues`). Donnée brute : `map-data/mxc40-mx-circuits.json`.

## Publication GitHub Pages

Le dépôt est configuré pour publier automatiquement `public/` via GitHub Pages (workflow `.github/workflows/deploy.yml`) à chaque `push` sur `master`.

### Activer côté GitHub (une seule fois)

1. Ouvrir **Settings** > **Pages** du dépôt.
2. Dans **Build and deployment**, choisir **Source: GitHub Actions**.
3. Pousser sur `master` (ou lancer le workflow manuellement).

Le workflow copie automatiquement `public/usa-map.html` vers `public/index.html` **au moment du déploiement** (sans redirection), ce qui rend l'application accessible à la racine du site Pages.

URL attendue :
- `https://<votre-user>.github.io/<nom-du-repo>/`
- (l’URL `.../usa-map.html` reste aussi valide)

Si vous utilisez un domaine custom, pointez-le ensuite depuis la page **Settings > Pages**.

### Mettre à jour les données Livability

```powershell
npm run scrape
```

Scrape les Quick Facts et données météo depuis Livability.com pour toutes les villes du projet.

### Régénérer les données fusionnées (app-data.json)

La carte charge un seul fichier `app-data.json` (fusion des JSON dans `map-data/`). Après avoir modifié l’un des JSON sources, régénérer le bundle :

```powershell
npm run build
```

## Livre « dont vous êtes le héros »

- **Prologue** : vous êtes à Bordeaux, vous envisagez les USA
- **5 régions** : Nord-Est, Sud, Midwest, Rocheuses & Sud-Ouest, Côte Pacifique
- **Chaque État** : contenu injecté depuis `app-data.json` (contraste, chiffres, conseil, lieux remarquables)
- **3 fins** : Explorateur (short-list), Spécialiste (une région), Aventurier (esprit ouvert)

Fichiers dans `book/` :
- `Livre_Heros_USA_50_Etats.docx` — Word (éditable, liens cliquables)
- `Livre_Heros_USA_50_Etats.pdf` — PDF pour lecture / impression

### Générer le livre

```powershell
npm run book        # Génère book/Livre_Heros_USA_50_Etats.docx (données app-data + data/paragraphs-usa.js)
npm run book:pdf    # Convertit le DOCX en PDF (nécessite : pip install docx2pdf + Microsoft Word sur Windows)
```

Pour tout régénérer : `npm run book ; npm run book:pdf`

## Sources de données

- [Livability.com](https://livability.com) — Quick Facts, LivScore, Top 100
- [U.S. News](https://realestate.usnews.com/places/rankings) — Best Places to Live
- [Bankrate](https://www.bankrate.com/real-estate/best-places-to-live-in-the-us/) — Best Places
- Carte SVG : SimpleMaps (voir licence dans `usa-states.svg`)
