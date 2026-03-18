# Chloé Voyage ✈️

> Low-carbon adventures, stunning photography, incredible food — exploring the world without wrecking it.

Chloé's travel blog: destinations, culture, photos and hidden gems, shared with passion and a carbon footprint that doesn't ruin the planet.

**Stack:** Nuxt 4 · TypeScript · Nuxt UI · Supabase · Pinia · Tailwind CSS v4 · Leaflet

---

## Getting started

```bash
npm install
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_KEY and THUNDERFOREST_API_KEY
npm run dev            # http://localhost:3000
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (used by Vercel) |
| `npm run preview` | Preview production build |

## Deployment (Vercel)

1. Connect the repo to a Vercel project
2. Set environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `THUNDERFOREST_API_KEY`, `VERCEL_DEPLOY_HOOK_URL` (server scope only)
3. Build command: `npm run build`
4. Create a Deploy Hook in Vercel (Settings > Git > Deploy Hooks, branch `main`) and paste the URL into `VERCEL_DEPLOY_HOOK_URL`

Once deployed, use the **"Redéployer le site"** button in `/admin` to trigger a rebuild after publishing trips. The public site updates in ~2 minutes.

---

## What it does

### Public (everyone)

- **Home page** — Chloé's intro + the 6 latest published trips in a grid
- **Trip detail** `/trips/[slug]` — block-based rich content, thumbnail, tags, date, destination
- Proper SEO on every page: title, description, og:image

### Admin (Chloé only)

- **`/admin`** — dashboard with all trips, one-click publish toggle, delete with confirmation, deploy button
- **`/admin/trips/new`** — create a new trip (metadata only)
- **`/admin/trips/[id]/edit`** — edit a trip + upload thumbnail + block editor

Auth is handled by Supabase — no passwords in the codebase, promise.

---

## Architecture

```
app/
├── pages/
│   ├── index.vue                  # Public home page
│   ├── trips/[slug].vue           # Trip detail (block renderer + HTML fallback)
│   └── admin/
│       ├── index.vue              # Dashboard (list + publish + delete)
│       └── trips/
│           ├── new.vue            # Create a trip
│           └── [id]/edit.vue      # Edit + thumbnail upload + block editor
├── components/
│   ├── BlockEditor.vue            # Block list manager (add/reorder/delete)
│   ├── ContentEditor.vue          # Per-slot content type selector (wysiwyg/image/gpx)
│   ├── GpxMap.vue                 # Leaflet map with GPX trace (Thunderforest tiles)
│   ├── RichTextEditor.vue         # TipTap WYSIWYG editor
│   └── TripForm.vue               # Shared trip form
├── composables/
│   ├── useTrips.ts                # Trip CRUD (Supabase)
│   ├── useStorageUpload.ts        # Image upload → compressed WebP → Supabase Storage
│   └── useGpxUpload.ts            # GPX file upload → Supabase Storage
├── stores/
│   └── auth.ts                    # useAuthStore: isAuthenticated, user, logout
├── layouts/
│   ├── default.vue                # Public layout
│   └── admin.vue                  # Admin layout
└── types/
    ├── database.types.ts          # Types generated from Supabase schema
    ├── blocks.ts                  # Block system types (SingleBlock, DoubleBlock, etc.)
    └── leaflet-gpx.d.ts           # Ambient declaration for leaflet-gpx plugin
```

### Data

Everything lives in a `trips` table in Supabase: `slug`, `title`, `summary`, `thumbnail_url`, `blocks` (JSONB), `destination`, `country`, `trip_date`, `tags[]`, `published`.

Images and GPX files are stored in the `travel-blog-images` Supabase Storage bucket. Images are automatically compressed to WebP before upload.

### Block system

Trip content is structured as an ordered list of blocks stored in `trips.blocks` (JSONB):

- **Single block** — full-width slot: wysiwyg text, image, or GPX map
- **Double block** — two side-by-side slots: wysiwyg text or image (no GPX)

Old trips using the `content` HTML field are still rendered (backwards-compatible fallback).

### Map

GPX traces are displayed using Leaflet with **Thunderforest OpenCycleMap** tiles — optimized for hiking, cycling and running routes. Requires a `THUNDERFOREST_API_KEY` (free plan available at thunderforest.com).

---

## Technical docs

- [`docs/public-pages.md`](docs/public-pages.md) — public pages and SEO
- [`docs/admin.md`](docs/admin.md) — admin interface and authentication
- [`docs/data-storage.md`](docs/data-storage.md) — data model, composables, storage, block system
