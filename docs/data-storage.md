# Données & stockage

## Modèle de données

Table `trips` dans Supabase :

| Champ | Type | Description |
|---|---|---|
| `id` | uuid | Clé primaire |
| `slug` | text | URL-friendly, unique |
| `title` | text | Titre du voyage |
| `summary` | text | Résumé court (utilisé en SEO description) |
| `content` | text | Contenu riche HTML |
| `cover_image_url` | text | URL publique complète (Supabase Storage) |
| `destination` | text | Ville / lieu |
| `country` | text | Pays |
| `trip_date` | date | Date du voyage |
| `tags` | text[] | Tableau de tags |
| `published` | boolean | Visible publiquement si `true` |

Types TypeScript : `Trip`, `TripInsert`, `TripUpdate` — exportés depuis `app/types/database.types.ts`.
Ne pas éditer ce fichier manuellement, le régénérer via `npx supabase gen types` si le schéma change.

## Composable `useTrips()`

| Méthode | Description |
|---|---|
| `fetchTrips()` | Tous les voyages (admin) |
| `fetchPublishedTrips(limit = 6)` | Voyages publiés uniquement, triés par date desc |
| `fetchTripBySlug(slug)` | Voyage publié par slug (page détail) |
| `fetchTrip(id)` | Voyage par id (admin edit) |
| `createTrip(data)` | Création |
| `updateTrip(id, data)` | Mise à jour partielle |
| `deleteTrip(id)` | Suppression + nettoyage image storage |

## Stockage des images — Supabase Storage

- Bucket : `travel-blog-images`
- Composable : `useStorageUpload()` → `upload(file, folder)` retourne `{ path, url }`
- Compression auto avant upload : WebP, max 0.8 MB, 1920 px, qualité 0.82 (`browser-image-compression`)
- Nom de fichier généré automatiquement : `{timestamp}-{uuid}.webp` — passer seulement le dossier, ex. `covers/{tripId}`
- L'URL publique complète est stockée dans `trips.cover_image_url`
- `deleteTrip()` supprime automatiquement le fichier storage associé
