# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Data model

```
trips          — main blog post entity (slug, title, summary, cover_image_url,
                 destination, country, trip_date, content, tags[], published)
trip_images    — gallery images linked to a trip (cloudinary_public_id, caption, position)
```

Convenience types exported from `database.types.ts`: `Trip`, `TripInsert`, `TripUpdate`, `TripImage`, `TripImageInsert`, `TripImageUpdate`.

## Engineering guidelines

- Reason as an experienced Nuxt 4 + TypeScript + Supabase developer
- KISS, DRY, clean code — no over-engineering
- Use `useSupabaseClient<Database>()` for full type inference on all queries
- Auth state lives in `useAuthStore()` — ne pas appeler `useSupabaseUser()` directement dans les composants
- Le middleware `auth` protège les routes `/admin/*` (sauf `/admin/login`)
- Always use `--legacy-peer-deps` when adding npm packages (vue-router v5 vs v4 peer dep conflict)
