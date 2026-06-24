# Pages publiques

Pages pré-rendues via `routeRules` (`prerender: true`) dans `nuxt.config.ts`.

## Page d'accueil `/`

- **Hero = carte d'Europe illustrée** (`EuropeMap.vue`) : planisphère plat SVG, style « illustration plate », pays colorés s'ils ont ≥1 article. Clic sur un pays → zoom prononcé dessus, pins des villes (avec noms) et panneau latéral « Liquid Glass » listant les voyages du pays.
- Présentation de Chloé (sous la carte) + grille des 6 derniers voyages publiés
- SEO : titre `Chloé explore`, description, og tags

Données : `useTrips().fetchPublishedTrips(6)` (grille) + `useTrips().fetchPublishedTripsForMap()` (carte — voyages publiés avec `latitude`/`longitude`).

### Carte Europe — `EuropeMap.vue`

- **Rendu** : SVG vectoriel via `d3-geo` (`geoMercator` + `geoPath`), calculé en `setup()` → **rendu SSR / prerender** (pas de `<ClientOnly>`). Aucune tuile ni clé externe.
- **Projection** : ajustée (`fitExtent`) sur une bbox Europe (−25/45°E, 34/72°N) ; la Sibérie/Turquie débordent et sont rognées par le `viewBox`.
- **Polygones** : `app/assets/geo/europe.geo.json` (Natural Earth admin-0 110m, filtré Europe, ISO via `ADM0_A3`), importé comme module. **Russie exclue** et **territoires d'outre-mer rognés** (polygones hors bbox Europe `[-26,33]..[46,73]`) pour des frontières/centroïdes propres. Le `country` texte libre est mappé vers l'ISO-A3 par `app/utils/countries.ts` (`countryToIso`).
- **Vue d'arrivée** : transform initial calculé en setup pour **cadrer l'ensemble des pays colorés** (`computeActiveFit`) → la page arrive déjà zoomée/centrée sur eux (SSR cohérent, pas de saut).
- **Survol** : nom du pays affiché dans une étiquette qui suit le curseur.
- **Zoom / pan** : clic sur un pays = zoom prononcé animé (tween rAF easeInOutCubic) ; molette, boutons +/− et glisser-déposer (drag) pour zoomer/se déplacer ; le bouton « recentrer » et le clic sur la mer reviennent au cadrage des pays colorés. Pins en overlay à taille constante synchronisés sur le transform.
- **Style** : palette `MapPalette` (`app/utils/mapPalettes.ts`, `DEFAULT_MAP_PALETTE` = `meadow`). Panneau latéral via `GlassPanel.vue` (tone `light`).
- **Mobile** : le panneau latéral devient une feuille qui monte depuis le bas (cap `60vh`, poignée), les contrôles de zoom passent en haut à gauche.

## Détail voyage `/trips/[slug]`

- Vignette pleine largeur (`thumbnail_url`)
- Titre, destination, pays, date de voyage, tags
- **Contenu par blocs** (`trip.blocks`)
- 404 si le voyage n'existe pas ou n'est pas publié (`fetchTripBySlug` filtre sur `published: true`)
- SEO : titre `Nom du voyage · Chloé explore`, description = résumé, `og:image` = thumbnail URL

### Rendu des blocs

| Type de bloc  | Rendu                                                                 |
| ------------- | --------------------------------------------------------------------- |
| `single`      | Pleine largeur — wysiwyg (`v-html`), image (`<img>`), gpx (`GpxMap`) |
| `double`      | Grille 2 colonnes — wysiwyg ou image uniquement                       |

Le composant `GpxMap` est rendu côté client uniquement via `<ClientOnly>` (Leaflet incompatible SSR).

### Carte GPX — `GpxMap.vue`

- Fond de carte : **Thunderforest OpenCycleMap** (pistes cyclables, sentiers balisés)
- Clé API requise : variable d'environnement `THUNDERFOREST_API_KEY`
- Trace chargée via `leaflet-gpx`, zoom automatique sur l'étendue de la trace au chargement
- Marqueur de départ : cercle vert avec icône play (SVG inline via `L.divIcon`)
- Marqueur d'arrivée : cercle rouge avec checkmark (SVG inline via `L.divIcon`)

## Conventions SEO

Pattern de titre : `${page} · Chloé explore` via `useSeoMeta({ title })` dans chaque page.
La page d'accueil utilise le titre fixe `Chloé explore` sans préfixe.
