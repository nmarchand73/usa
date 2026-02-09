# USA Interactive Map & Travel Guide

Carte interactive des **50 États US + Washington DC** avec données socio-économiques et guide « dont vous êtes le héros » pour explorer les meilleurs endroits où vivre.

## Structure du projet

```
/
├── public/                  # Racine du serveur (npm start)
│   ├── usa-map.html        # Carte interactive (app principale)
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
│   ├── merge-json.js       # Fusionne map-data/*.json → public/app-data.json
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
- **Chaque État** : meilleures villes, coût, climat, atouts pour un Français
- **3 fins** : Explorateur (short-list), Spécialiste (une région), Aventurier (esprit ouvert)

Fichiers dans `book/` :
- `Livre_Heros_USA_50_Etats.docx` — Word (éditable, liens cliquables)
- `Livre_Heros_USA_50_Etats.pdf` — PDF pour lecture / impression

## Sources de données

- [Livability.com](https://livability.com) — Quick Facts, LivScore, Top 100
- [U.S. News](https://realestate.usnews.com/places/rankings) — Best Places to Live
- [Bankrate](https://www.bankrate.com/real-estate/best-places-to-live-in-the-us/) — Best Places
- Carte SVG : SimpleMaps (voir licence dans `usa-states.svg`)
