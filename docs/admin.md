# Interface admin

Accessible sur `/admin/*`, protégé par `@nuxtjs/supabase` (`redirectOptions` dans `nuxt.config.ts`).
Pas de middleware custom — ne pas en créer.

## Routes

| Route | Rôle |
|---|---|
| `/admin` | Liste de tous les voyages + publication + suppression |
| `/admin/trips/new` | Création d'un voyage (métadonnées uniquement) |
| `/admin/trips/[id]/edit` | Édition complète : métadonnées + vignette + blocs de contenu |

## `/admin` — Dashboard

- Tableau `UTable` listant tous les voyages (titre, destination, pays, date)
- **Toggle publication** : `USwitch` → `updateTrip(id, { published: !current })` — publie/dépublie instantanément dans Supabase
- **Édition** : bouton lien vers `/admin/trips/[id]/edit`
- **Suppression** : modal de confirmation → `deleteTrip(id)` (supprime aussi l'image storage)
- **Redéployer le site** : bouton (masqué en dev, visible uniquement en production) → POST `/api/redeploy` → déclenche un nouveau build Vercel via deploy hook. Le site public reflète les changements en ~2 minutes.

> Le bouton de redéploiement est caché en mode développement (`import.meta.dev`). Il nécessite la variable d'environnement serveur `VERCEL_DEPLOY_HOOK_URL`.

> La page `/admin/trips/index.vue` a été supprimée. La gestion des voyages est sur `/admin` directement.

## `/admin/trips/new` — Création

- Formulaire : titre, slug, destination, pays, date, résumé, tags
- Après création réussie : redirect vers `/admin/trips/[id]/edit` pour uploader la vignette et éditer les blocs

## `/admin/trips/[id]/edit` — Édition

- Modification de tous les champs du voyage
- Upload vignette via `useStorageUpload()` (compressée en WebP automatiquement)
- **Éditeur de blocs** : composant `BlockEditor` (disponible uniquement sur la page edit, pas sur new)

### `BlockEditor`

Gestionnaire de liste de blocs. Props : `modelValue: BlockList`, `tripId: string`.

| Action      | Description                                          |
| ----------- | ---------------------------------------------------- |
| Ajouter     | Boutons "Bloc simple" / "Bloc double"                |
| Réordonner  | Flèches haut / bas                                   |
| Supprimer   | Bouton corbeille avec confirmation                   |

### `ContentEditor`

Sélecteur de type de contenu par slot. Props : `modelValue: SlotContent | DoubleSlotContent`, `allowGpx: boolean`, `tripId: string`.

- Boutons de sélection : wysiwyg / image / gpx (gpx masqué si `allowGpx: false`)
- **wysiwyg** : éditeur TipTap (`RichTextEditor`)
- **image** : upload via `useStorageUpload()`, dossier `blocks/{tripId}`
- **gpx** : upload via `useGpxUpload()`, dossier `gpx/{tripId}`, prévisualisation `GpxMap`

## Authentification

- `useAuthStore()` — `isAuthenticated`, `user`, `logout()`
- Après login : `useSupabaseCookieRedirect().pluck()` pour rediriger vers le chemin mémorisé (ou `/admin`)
- `pluck()` consomme le cookie — ne pas utiliser `redirectInfo.path.value` directement
