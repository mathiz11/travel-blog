# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

- `docs/public-pages.md` — pages publiques (home, détail voyage, SEO)
- `docs/admin.md` — interface admin (dashboard, création, édition, auth)
- `docs/data-storage.md` — modèle de données, composable `useTrips()`, Supabase Storage, système de blocs

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build (used by Vercel)
npm run preview    # Preview production build locally
```

No test runner is configured yet.

## Architecture

**Travel blog** built with Nuxt 4, TypeScript, Nuxt UI, and Supabase.

### Directory layout (Nuxt 4 `app/` convention)

- `app/app.vue` — root component, wraps everything in `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>`
- `app/pages/` — file-based routes
- `app/layouts/` — shared layouts
- `app/composables/` — shared composables
- `app/stores/` — Pinia stores (auto-imported)
- `app/middleware/` — route middlewares
- `app/types/` — TypeScript types (including `database.types.ts`, `blocks.ts`, `leaflet-gpx.d.ts`)
- `app/assets/css/main.css` — Tailwind CSS v4 + Nuxt UI + Leaflet CSS imports
- `nuxt.config.ts` — modules: `@nuxt/ui`, `@nuxtjs/supabase`, `@pinia/nuxt`; global CSS: `~/assets/css/main.css`
- `server/api/` — server-only API routes

Nuxt auto-imports all Vue primitives, Nuxt built-ins, `app/composables/`, and `app/stores/`.

## Modules

### Nuxt UI

Component library (Tailwind CSS v4 + Reka UI). Docs: https://ui.nuxt.com/docs/components
All `U*` components are auto-imported. Icons use the `i-lucide-*` convention.
Always prefer Nuxt UI components over raw HTML equivalents (e.g. `UHeader`/`UMain` over `<header>`/`<main>`, `UContainer` over `<div class="container">`).

Key layout components: `UApp`, `UHeader`, `UMain`, `UContainer`, `UFooter`, `USidebar`.
Key dashboard components: `UDashboardNavbar`, `UDashboardSidebar`, `UDashboardSidebarToggle`.

### Pinia (`@pinia/nuxt`)

Stores are defined with `defineStore` in `app/stores/` and auto-imported.

- `useAuthStore()` — `isAuthenticated`, `user`, `logout()`

### Supabase (`@nuxtjs/supabase`)

- `useSupabaseClient<Database>()` — typed Supabase client
- `useSupabaseUser()` — reactive current user
- Credentials: `.env` (`SUPABASE_URL`, `SUPABASE_KEY`)
- Types: `app/types/database.types.ts` (generated from schema, **do not edit manually** — regenerate via `npx supabase gen types` if schema changes)

#### Auth & redirects

La protection des routes `/admin/*` est gérée par le plugin `auth-redirect` de `@nuxtjs/supabase` via `redirectOptions` dans `nuxt.config.ts` — **pas de middleware custom**. Ne pas créer de middleware `auth.ts`.

Après un login réussi, utiliser `useSupabaseCookieRedirect().pluck()` pour rediriger vers le chemin mémorisé (ou `/admin` par défaut) :

```ts
const redirectInfo = useSupabaseCookieRedirect();
// après signInWithPassword sans erreur :
await navigateTo(redirectInfo.pluck() ?? "/admin");
```

`pluck()` consomme le cookie — ne pas utiliser `redirectInfo.path.value` directement.

## Data model

```
trips       — main blog post entity (slug, title, summary, thumbnail_url,
              destination, country, trip_date, blocks, tags[], published)
```

Convenience types exported from `database.types.ts`: `Trip`, `TripInsert`, `TripUpdate`.

> Le champ `blocks` est typé `blocks?: unknown` dans les convenience types (extension manuelle) pour éviter les erreurs de récursion infinie dans les génériques Supabase. Ne pas ajouter `blocks` dans la définition `Database` native ni ajouter `Relationships: []` (casse le retour de `.select("*")`).

### Système de blocs — `app/types/blocks.ts`

Les blocs remplacent `content` pour les nouveaux voyages. Stockés en JSONB dans `trips.blocks`.

- `SingleBlock` — 1 slot : `wysiwyg | image | gpx`
- `DoubleBlock` — 2 slots côte à côte : `wysiwyg | image | gpx`

### Image storage — Supabase Storage

Images et fichiers GPX stockés dans le bucket **`travel-blog-images`**.

- `useStorageUpload()` — `upload(file, path)` retourne `{ path, url }` — images compressées WebP
- `useGpxUpload()` — `upload(file, path)` retourne `{ path, url }` — upload direct `application/octet-stream`
- Dossiers : `thumbnails/{tripId}` (vignette), `blocks/{tripId}` (images blocs), `gpx/{tripId}` (traces GPX)
- L'URL publique complète est stockée dans `trips.thumbnail_url` ou dans le champ `url` du bloc
- `deleteTrip()` supprime automatiquement la vignette storage

### Carte GPX — `GpxMap.vue`

- Fond de carte : **Thunderforest OpenCycleMap** (`cycle`) via `runtimeConfig.public.thunderforestApiKey`
- Variable d'environnement : `THUNDERFOREST_API_KEY`
- `leaflet` et `leaflet-gpx` chargés dynamiquement dans `onMounted` (incompatibles SSR)
- `leaflet-gpx` est un plugin Leaflet : import side-effect uniquement, accès via `(L as any).GPX`
- Marqueurs start/end : `L.divIcon` SVG inline (vert play / rouge checkmark) — ne pas utiliser `marker_options.startIconUrl` avec data URIs (problèmes d'encodage)

### Trip management — `useTrips()`

CRUD composable: `fetchTrips()`, `fetchPublishedTrips(limit)`, `fetchTripBySlug(slug)`, `fetchTrip(id)`, `createTrip(data)`, `updateTrip(id, data)`, `deleteTrip(id)`.

- `fetchPublishedTrips(limit = 6)` — only published trips, ordered by date desc, used on the public home page
- `fetchTripBySlug(slug)` — fetches a single published trip by slug, used on detail page

After a Supabase query, use `data!` (non-null assertion) once `if (error) throw error` has been called — Supabase types `data` as `T | null` even when there is no error.

### Admin pages

- `/admin` — liste des voyages avec toggle de publication (`USwitch` → `updateTrip(id, { published })`) et suppression
- `/admin/trips/new` — création (redirect vers edit après création pour permettre l'upload de vignette et l'édition des blocs)
- `/admin/trips/[id]/edit` — modification + upload vignette + éditeur de blocs (`BlockEditor`)

`BlockEditor` et `ContentEditor` sont les composants d'édition de blocs. `BlockEditor` n'est rendu que lorsque `tripId` est disponible (page edit uniquement, pas new).

La page `/admin/trips/index.vue` a été supprimée — la gestion des voyages est désormais sur `/admin` directement.

### Public pages

- `/` — page d'accueil : hero de présentation de Chloé + grille des 6 derniers voyages publiés
- `/trips/[slug]` — détail d'un voyage (blocs de contenu ou fallback HTML, vignette, tags, date, SEO)

Ces pages sont pré-rendues via `routeRules` (`prerender: true`) dans `nuxt.config.ts`. Les pages admin utilisent `ssr: false` (SPA).

### Déploiement Vercel

- Build command : `npm run build`
- Route serveur `server/api/redeploy.post.ts` — déclenche un build Vercel via deploy hook (URL dans `VERCEL_DEPLOY_HOOK_URL`, scope server uniquement). Valide le JWT Supabase avant d'appeler le hook.
- Le bouton "Redéployer le site" dans `/admin` est masqué en dev (`import.meta.dev`).

### Variables d'environnement

| Variable | Scope | Description |
|---|---|---|
| `SUPABASE_URL` | public | URL du projet Supabase |
| `SUPABASE_KEY` | public | Clé anon Supabase |
| `THUNDERFOREST_API_KEY` | public | Clé API Thunderforest (tuiles carte) |
| `VERCEL_DEPLOY_HOOK_URL` | server | URL du deploy hook Vercel |

### SEO

- Titre global : `useSeoMeta` avec pattern `Titre · Chloé Voyage`
- Home : titre fixe `Chloé Voyage`
- Détail voyage : `${trip.title} · Chloé Voyage` + `ogImage` = thumbnail URL

### Tailwind CSS v4 — `@apply` dans `<style scoped>`

Toujours ajouter `@reference "~/assets/css/main.css";` en première ligne de tout bloc `<style scoped>` utilisant `@apply`, sinon erreur "Cannot apply unknown utility class".

### Cards avec image pleine largeur

Ne pas utiliser le slot `#header` de `UCard` pour les images (ajoute du padding/margin interne). Utiliser un `div` avec `overflow-hidden rounded-xl border` à la place.

## TypeScript

Strict mode is enabled via `nuxt.config.ts`:

```ts
typescript: {
  strict: true,
  tsConfig: {
    compilerOptions: {
      noUncheckedIndexedAccess: true,
      noImplicitOverride: true,
    },
  },
},
```

- Pour `UInput` bound to `string | null | undefined` fields (e.g. `trip_date`), use `:model-value="val ?? undefined"` + `@update:model-value`
- Le type `blocks?: unknown` dans les convenience types évite la récursion infinie du type `Json` de Supabase
- `leaflet-gpx.d.ts` doit être un script file (pas de top-level import) pour que `declare module` soit global

## Engineering guidelines

- Reason as an experienced Nuxt 4 + TypeScript + Supabase developer
- KISS, DRY, clean code — no over-engineering
- Use `useSupabaseClient<Database>()` for full type inference on all queries
- Auth state lives in `useAuthStore()` — ne pas appeler `useSupabaseUser()` directement dans les composants
- La protection des routes `/admin/*` est assurée par `@nuxtjs/supabase` (`redirectOptions`) — ne pas créer de middleware `auth` custom
- Always use `--legacy-peer-deps` when adding npm packages (vue-router v5 vs v4 peer dep conflict)
