# Données & stockage

## Modèle de données

Table `trips` dans Supabase :

| Champ           | Type    | Description                                             |
| --------------- | ------- | ------------------------------------------------------- |
| `id`            | uuid    | Clé primaire                                            |
| `slug`          | text    | URL-friendly, unique                                    |
| `title`         | text    | Titre du voyage                                         |
| `summary`       | text    | Résumé court (utilisé en SEO description)               |
| `blocks`        | jsonb   | Système de blocs (voir ci-dessous) — nullable           |
| `thumbnail_url` | text    | URL publique complète de la vignette (Supabase Storage) |
| `destination`   | text    | Ville / lieu                                            |
| `country`       | text    | Pays                                                    |
| `trip_date`     | date    | Date du voyage                                          |
| `tags`          | text[]  | Tableau de tags                                         |
| `published`     | boolean | Visible publiquement si `true`                          |

Types TypeScript : `Trip`, `TripInsert`, `TripUpdate` — exportés depuis `app/types/database.types.ts`.
Ne pas éditer ce fichier manuellement, le régénérer via `npx supabase gen types` si le schéma change.

> Le champ `blocks` est ajouté via extension des convenience types (`blocks?: unknown`) pour éviter les erreurs de récursion infinie dans les génériques Supabase. Ne pas l'ajouter dans la définition `Database` native.

## Système de blocs — `app/types/blocks.ts`

Les blocs remplacent le champ `content` pour les nouveaux voyages. Ils sont stockés en JSONB dans `trips.blocks`.

### Types de blocs

```ts
SingleBlock  — 1 slot de contenu (wysiwyg | image | gpx)
DoubleBlock  — 2 slots côte à côte (wysiwyg | image, GPX non autorisé)
```

### Types de contenu par slot

| Type       | Champs                                    | Autorisé dans double ? |
| ---------- | ----------------------------------------- | ---------------------- |
| `wysiwyg`  | `html: string`                            | ✅                      |
| `image`    | `url`, `storagePath`, `alt?`              | ✅                      |
| `gpx`      | `url`, `storagePath`, `label?`            | ❌                      |

### Migration SQL

```sql
-- Ajouter la colonne blocks (si pas encore fait)
ALTER TABLE trips ADD COLUMN blocks jsonb DEFAULT NULL;

-- Supprimer l'ancien champ content
ALTER TABLE trips DROP COLUMN content;
```

## Composable `useTrips()`

| Méthode                          | Description                                     |
| -------------------------------- | ----------------------------------------------- |
| `fetchTrips()`                   | Tous les voyages (admin)                        |
| `fetchPublishedTrips(limit = 6)` | Voyages publiés uniquement, triés par date desc |
| `fetchTripBySlug(slug)`          | Voyage publié par slug (page détail)            |
| `fetchTrip(id)`                  | Voyage par id (admin edit)                      |
| `createTrip(data)`               | Création                                        |
| `updateTrip(id, data)`           | Mise à jour partielle                           |
| `deleteTrip(id)`                 | Suppression + nettoyage image storage           |

## Stockage des fichiers — Supabase Storage

- Bucket : `travel-blog-images`

### Images — `useStorageUpload()`

- Composable : `useStorageUpload()` → `upload(file, folder)` retourne `{ path, url }`
- Compression auto avant upload : WebP, max 0.8 MB, 1920 px, qualité 0.82 (`browser-image-compression`)
- Nom de fichier généré automatiquement : `{timestamp}-{uuid}.webp` — passer seulement le dossier
- Dossiers utilisés : `thumbnails/{tripId}` (vignette), `blocks/{tripId}` (images de blocs)
- L'URL publique complète est stockée dans `trips.thumbnail_url` ou dans le champ `url` du bloc image
- `deleteTrip()` supprime automatiquement le fichier storage de la vignette

### Fichiers GPX — `useGpxUpload()`

- Composable : `useGpxUpload()` → `upload(file, folder)` retourne `{ path, url }`
- Pas de compression — upload direct en `application/octet-stream`
- Nom de fichier généré automatiquement : `{timestamp}-{uuid}.gpx`
- Dossier utilisé : `gpx/{tripId}`
- L'URL publique est stockée dans le champ `url` du bloc GPX
