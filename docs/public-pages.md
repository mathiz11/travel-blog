# Pages publiques

Pages pré-rendues via `routeRules` (`prerender: true`) dans `nuxt.config.ts`.

## Page d'accueil `/`

- Hero de présentation de Chloé (voyages bas carbone, photos, gastronomie, culture)
- Grille des 6 derniers voyages publiés : vignette pleine largeur, titre, destination, date, tags
- SEO : titre `Chloé Voyage`, description, og tags

Données : `useTrips().fetchPublishedTrips(6)` — uniquement les voyages `published: true`, triés par date desc.

## Détail voyage `/trips/[slug]`

- Vignette pleine largeur (`thumbnail_url`)
- Titre, destination, pays, date de voyage, tags
- **Contenu par blocs** (`trip.blocks`)
- 404 si le voyage n'existe pas ou n'est pas publié (`fetchTripBySlug` filtre sur `published: true`)
- SEO : titre `Nom du voyage · Chloé Voyage`, description = résumé, `og:image` = thumbnail URL

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

Pattern de titre : `${page} · Chloé Voyage` via `useSeoMeta({ title })` dans chaque page.
La page d'accueil utilise le titre fixe `Chloé Voyage` sans préfixe.
