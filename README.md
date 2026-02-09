# USA Interactive Map & Travel Guide

Carte interactive des **50 États US + Washington DC** avec données socio-économiques et guide « dont vous êtes le héros » pour explorer les meilleurs endroits où vivre.

## Structure du projet

```
/
├── usa-map.html             # Carte interactive (app principale)
├── usa-states.svg           # Carte SVG des États
├── state-map.json           # Données: États, villes, Livability, classements
├── city-coordinates.json    # Coordonnées GPS des villes
├── venues-map.json          # Données: venues SX/VTT/BMX
├── tracks-by-state.json     # Données: circuits motorsport par État
│
├── book/                    # Livre généré (DOCX + PDF)
│   ├── Livre_Heros_USA_50_Etats.docx
│   └── Livre_Heros_USA_50_Etats.pdf
│
├── data/                    # Données sources (enrichissement)
│   ├── paragraphs-usa.js    # Textes du livre par État
│   ├── state-codes.js       # Codes ISO des États
│   ├── state-cities.js      # Villes par État
│   ├── state-urls.js        # URLs officielles
│   ├── state-french-data.js # Données francophones
│   └── criteria-data.js     # Critères de comparaison
│
├── scripts/                 # Scripts de maintenance
│   └── scrape-livability-cities.js  # Scraping Livability.com
│
├── package.json
├── launch-site.bat          # Lancement rapide (Windows)
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
npx serve .
```

Puis ouvrir [http://localhost:3000/usa-map.html](http://localhost:3000/usa-map.html)

> Sous Windows : double-cliquer `launch-site.bat`

### Mettre à jour les données Livability

```powershell
npm run scrape
```

Scrape les Quick Facts et données météo depuis Livability.com pour toutes les villes du projet.

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
