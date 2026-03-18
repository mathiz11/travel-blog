# Interface admin

Accessible sur `/admin/*`, protégé par `@nuxtjs/supabase` (`redirectOptions` dans `nuxt.config.ts`).
Pas de middleware custom — ne pas en créer.

## Routes

| Route | Rôle |
|---|---|
| `/admin` | Liste de tous les voyages + publication + suppression |
| `/admin/trips/new` | Création d'un voyage |
| `/admin/trips/[id]/edit` | Édition + upload image de couverture |

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
- Après création réussie : redirect vers `/admin/trips/[id]/edit` pour uploader l'image

## `/admin/trips/[id]/edit` — Édition

- Modification de tous les champs du voyage
- Upload image de couverture via `useStorageUpload()` (compressée en WebP automatiquement)
- Éditeur de contenu riche : composant `RichTextEditor` (`modelValue?: string`)

## Authentification

- `useAuthStore()` — `isAuthenticated`, `user`, `logout()`
- Après login : `useSupabaseCookieRedirect().pluck()` pour rediriger vers le chemin mémorisé (ou `/admin`)
- `pluck()` consomme le cookie — ne pas utiliser `redirectInfo.path.value` directement
