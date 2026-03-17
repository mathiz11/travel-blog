# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

- `docs/public-pages.md` — pages publiques (home, détail voyage, SEO)
- `docs/admin.md` — interface admin (dashboard, création, édition, auth)
- `docs/data-storage.md` — modèle de données, composable `useTrips()`, Supabase Storage

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production
npm run generate   # Static site generation
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
- `app/types/` — TypeScript types (including `database.types.ts`)
- `app/assets/css/main.css` — Tailwind CSS v4 + Nuxt UI imports
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
const redirectInfo = useSupabaseCookieRedirect()
// après signInWithPassword sans erreur :
await navigateTo(redirectInfo.pluck() ?? '/admin')
```

`pluck()` consomme le cookie — ne pas utiliser `redirectInfo.path.value` directement.

## Data model

```
trips       — main blog post entity (slug, title, summary, cover_image_url,
              destination, country, trip_date, content, tags[], published)
```

Convenience types exported from `database.types.ts`: `Trip`, `TripInsert`, `TripUpdate`.

### Image storage — Supabase Storage

Images are stored in the **`travel-blog-images`** bucket (Supabase Storage), not Cloudinary.

- Composable: `useStorageUpload()` — `upload(file, path)` returns `{ path, url }`
- Before upload, images are compressed to WebP via `browser-image-compression` (max 0.8 MB, 1920 px, quality 0.82)
- The composable generates the filename itself: `{timestamp}-{uuid}.webp` — callers pass only the folder, e.g. `covers/{tripId}`
- Cover image URL is stored as a full public URL in `trips.cover_image_url`
- On trip deletion, `useTrips.deleteTrip()` removes the cover from storage automatically

### Trip management — `useTrips()`

CRUD composable: `fetchTrips()`, `fetchPublishedTrips(limit)`, `fetchTripBySlug(slug)`, `fetchTrip(id)`, `createTrip(data)`, `updateTrip(id, data)`, `deleteTrip(id)`.

- `fetchPublishedTrips(limit = 6)` — only published trips, ordered by date desc, used on the public home page
- `fetchTripBySlug(slug)` — fetches a single published trip by slug, used on detail page

After a Supabase query, use `data!` (non-null assertion) once `if (error) throw error` has been called — Supabase types `data` as `T | null` even when there is no error.

### Admin pages

- `/admin` — liste des voyages avec toggle de publication (`USwitch` → `updateTrip(id, { published })`) et suppression
- `/admin/trips/new` — création (redirect vers edit après création pour permettre l'upload d'image)
- `/admin/trips/[id]/edit` — modification + upload image de couverture

La page `/admin/trips/index.vue` a été supprimée — la gestion des voyages est désormais sur `/admin` directement.

### Public pages

- `/` — page d'accueil : hero de présentation de Chloé + grille des 6 derniers voyages publiés
- `/trips/[slug]` — détail d'un voyage (contenu riche, image de couverture, tags, date, SEO)

Ces pages sont générées de manière statique via `npm run generate`.

### SEO

- Titre global : `useSeoMeta` avec pattern `Titre · Chloé Voyage`
- Home : titre fixe `Chloé Voyage`
- Détail voyage : `${trip.title} · Chloé Voyage` + `ogImage` = cover URL

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

- `RichTextEditor` accepts `modelValue?: string` (optional) to be compatible with `TripInsert | TripUpdate`
- For `UInput` bound to `string | null | undefined` fields (e.g. `trip_date`), use `:model-value="val ?? undefined"` + `@update:model-value`

## Engineering guidelines

- Reason as an experienced Nuxt 4 + TypeScript + Supabase developer
- KISS, DRY, clean code — no over-engineering
- Use `useSupabaseClient<Database>()` for full type inference on all queries
- Auth state lives in `useAuthStore()` — ne pas appeler `useSupabaseUser()` directement dans les composants
- La protection des routes `/admin/*` est assurée par `@nuxtjs/supabase` (`redirectOptions`) — ne pas créer de middleware `auth` custom
- Always use `--legacy-peer-deps` when adding npm packages (vue-router v5 vs v4 peer dep conflict)
