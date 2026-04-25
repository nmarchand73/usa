# Carte « Lyon + banlieue » — design (2026-04-25)

## Objectif
Créer une page **carte interactive** (même style que `public/france-map.html`) pour **identifier les meilleurs endroits où habiter** autour de Lyon, en s’appuyant sur 2 sources éditoriales :

- **Actu.fr** : « 20 communes “de rêve” où habiter près de Lyon » (classement + note /100).  
  Source : `https://actu.fr/auvergne-rhone-alpes/lyon_69123/classement-voici-les-20-communes-de-reve-ou-habiter-pres-de-lyon_60673554.html`
- **CityCrunch** : « Où habiter à Lyon en 2025 ? Notre avis sur chaque arrondissement » (texte subjectif par arrondissement).  
  Source : `https://lyon.citycrunch.fr/ou-habiter-a-lyon-en-2025-notre-avis-sur-chaque-arrondissement/2025/06/11/`

## Principes
- **Transparence** : ne pas donner une illusion de précision. On garde **2 scores séparés** (Actu vs CityCrunch) + un **score combiné** uniquement pour établir un Top global (départage).
- **Lisibilité** : infobulles (tooltips) très explicites, lien **Google Maps satellite** depuis chaque point.
- **Même UX** : légende/filtres au-dessus, carte Leaflet, panneau à droite, thème sombre, plein écran.

## Livrables
- **Page** : `public/lyon-map.html`
- **Données** : `map-data/lyon-zones.json` (sources + géométries/coords + scores)
- **Bundle (option)** : `public/app-data-lyon.json` (si on veut un build similaire), ou chargement direct de `map-data/lyon-zones.json` depuis `public/` (copie au build).
- **README** : ajout d’une section “Carte Lyon”.

## Périmètre géographique
- Carte centrée sur Lyon (environ \(45.764, 4.835\)), zoom initial ~11–12.
- Points :
  - **Arrondissements 1→9** : points (centroïdes) + éventuellement contours si GeoJSON simple disponible.
  - **Communes autour de Lyon** : points (centroïdes) des 20 communes.

## Modèle de données (proposition)
Fichier `map-data/lyon-zones.json` :

```json
{
  "fetchedAt": "ISO",
  "sources": {
    "actu": { "title": "...", "url": "..." },
    "citycrunch": { "title": "...", "url": "..." }
  },
  "items": [
    {
      "id": "commune|ecully",
      "kind": "commune",
      "name": "Écully",
      "lat": 45.77,
      "lng": 4.78,
      "scores": {
        "actu": 66,
        "citycrunch": null,
        "combined": 66
      },
      "explain": {
        "actu": "Classement Ville de rêve : 66/100 (Actu.fr).",
        "citycrunch": null
      },
      "links": {
        "sourceActu": "...",
        "googleSatellite": "..."
      }
    }
  ]
}
```

Notes :
- `combined` = `actu` si présent, sinon `citycrunch`.
- `googleSatellite` se calcule côté UI via `lat/lng`.

## Calcul des scores
### Score Actu.fr (communes)
- Utiliser directement les notes /100 du Top 20 :
  1) Ecully 66
  2) Francheville 64
  3) Chaponost 64
  4) Tassin-la-Demi-Lune 63
  5) Caluire-et-Cuire 63
  6) Sainte-Foy-lès-Lyon 62
  7) Dardilly 62
  8) Saint-Didier-au-Mont-d’Or 61
  9) Oullins 61
  10) Saint-Romain-au-Mont-d’Or 60
  11) Saint-Genis-Laval 60
  12) Sathonay-Village 59
  13) Vénissieux 59
  14) Saint-Cyr-au-Mont-d’Or 59
  15) Irigny 59
  16) Craponne 59
  17) Bron 59
  18) Saint-Priest 58
  19) Rillieux-la-Pape 57
  20) Marcy-l’Étoile 57

### Score CityCrunch (arrondissements)
CityCrunch ne donne pas de note numérique ; on crée un **barème explicite** (0–100) basé sur l’intention du texte “Notre avis”.

Proposition (à appliquer à chaque arrondissement via un verdict court qu’on fixe à la main) :
- **95** : “On adore / top / foncez / idéal” (recommandé très fort)
- **85** : “Très bien / parfait si X / super plan”
- **70** : “Bien / pratique / correct”
- **55** : “Mitigé / dépend des coins / inégal”
- **40** : “Plutôt déconseillé (sauf cas spécifique)”

Chaque arrondissement aura :
- `verdictLabel` (ex. “Recommandé”, “Mitigé”…)
- `verdictScore` (valeur ci-dessus)
- `explain.citycrunch` (1–2 phrases max + points forts/faibles)

## UI/UX de `lyon-map.html`
### Filtres
- **Top global (score combiné)** (par défaut ON)
- **Communes (Actu.fr)** (ON)
- **Arrondissements (CityCrunch)** (ON)

### Styles / encodage visuel
- Couleur par source :
  - Communes Actu : vert (bon) → jaune (moyen) → rouge (faible) selon score.
  - Arrondissements : bleu/violet (distinct) + intensité selon score.
- Taille des points : proportionnelle au score combiné (ou discrète : 3 tailles).

### Tooltips / popups
- Tooltip (hover) :
  - Type (Commune / Arrondissement)
  - Nom
  - Score + source
  - 1 ligne “Pourquoi”
- Popup (click) :
  - Résumé plus détaillé (2–4 puces)
  - Liens : article source + Google Maps satellite

### Panneau latéral (droite)
Deux sections :
- **Top 10 global** : tri par `combined`, montre “source principale” (Actu/CityCrunch)
- **Détails** : quand on clique un point, affiche la fiche (scores, texte, liens)

## Données géographiques (coords)
- **Centroides** :
  - Communes : Nominatim “`<commune>, Métropole de Lyon, France`” (ou département) avec rate limit (comme scripts existants).
  - Arrondissements : requêtes Nominatim “`Lyon 1er arrondissement` …”.
- Stocker `nominatimDisplayName`/`placeId` pour audit.

## Dépendances / intégration
- Reprendre Leaflet + D3 (si contours) déjà utilisés.
- Aucun backend : page statique.

## Plan de test (manuel)
- Charger `public/lyon-map.html` en local.
- Vérifier :
  - Les 20 communes sont visibles, cliquables, score Actu affiché.
  - Les 9 arrondissements sont visibles, cliquables, verdict CityCrunch affiché.
  - Le Top global se met à jour si on désactive une source.
  - Chaque point a un lien **Google Maps satellite** valide.
  - Tooltips explicites (pas de jargon, pas de texte trop long).

## Hors scope (pour v1)
- Contours exacts des arrondissements/communes (points uniquement).
- Données chiffrées externes (prix immo, insécurité, etc.). On reste sur les 2 articles.
- Reco “au m²” par budget.

