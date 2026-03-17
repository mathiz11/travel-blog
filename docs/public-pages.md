# Pages publiques

Pages générées statiquement via `npm run generate`.

## Page d'accueil `/`

- Hero de présentation de Chloé (voyages bas carbone, photos, gastronomie, culture)
- Grille des 6 derniers voyages publiés : cover image pleine largeur, titre, destination, date, tags
- SEO : titre `Chloé Voyage`, description, og tags

Données : `useTrips().fetchPublishedTrips(6)` — uniquement les voyages `published: true`, triés par date desc.

## Détail voyage `/trips/[slug]`

- Image de couverture pleine largeur
- Titre, destination, pays, date de voyage, tags
- Contenu riche (`v-html` du champ `content`)
- 404 si le voyage n'existe pas ou n'est pas publié (`fetchTripBySlug` filtre sur `published: true`)
- SEO : titre `Nom du voyage · Chloé Voyage`, description = résumé, `og:image` = cover URL

## Conventions SEO

Pattern de titre : `${page} · Chloé Voyage` via `useSeoMeta({ title })` dans chaque page.
La page d'accueil utilise le titre fixe `Chloé Voyage` sans préfixe.
