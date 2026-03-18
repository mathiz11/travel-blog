# Chloé Voyage ✈️

> Low-carbon adventures, stunning photography, incredible food — exploring the world without wrecking it.

Chloé's travel blog: destinations, culture, photos and hidden gems, shared with passion and a carbon footprint that doesn't ruin the planet.

**Stack:** Nuxt 4 · TypeScript · Nuxt UI · Supabase · Pinia · Tailwind CSS v4

---

## Getting started

```bash
npm install
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_KEY
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
2. Set environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `VERCEL_DEPLOY_HOOK_URL` (server scope only)
3. Build command: `npm run build`
4. Create a Deploy Hook in Vercel (Settings > Git > Deploy Hooks, branch `main`) and paste the URL into `VERCEL_DEPLOY_HOOK_URL`

Once deployed, use the **"Redéployer le site"** button in `/admin` to trigger a rebuild after publishing trips. The public site updates in ~2 minutes.

---

## What it does

### Public (everyone)

- **Home page** — Chloé's intro + the 6 latest published trips in a grid
- **Trip detail** `/trips/[slug]` — rich content, cover image, tags, date, destination
- Proper SEO on every page: title, description, og:image

### Admin (Chloé only)

- **`/admin`** — dashboard with all trips, one-click publish toggle, delete with confirmation, deploy button
- **`/admin/trips/new`** — create a new trip
- **`/admin/trips/[id]/edit`** — edit a trip + upload cover image

Auth is handled by Supabase — no passwords in the codebase, promise.

---

## Architecture

```
app/
├── pages/
│   ├── index.vue              # Public home page
│   ├── trips/[slug].vue       # Trip detail
│   └── admin/
│       ├── index.vue          # Dashboard (list + publish + delete)
│       └── trips/
│           ├── new.vue        # Create a trip
│           └── [id]/edit.vue  # Edit + cover image upload
├── composables/
│   ├── useTrips.ts            # Trip CRUD (Supabase)
│   └── useStorageUpload.ts    # Image upload → compressed WebP → Supabase Storage
├── stores/
│   └── auth.ts                # useAuthStore: isAuthenticated, user, logout
├── layouts/
│   ├── default.vue            # Public layout
│   └── admin.vue              # Admin layout
└── types/
    └── database.types.ts      # Types generated from Supabase schema
```

### Data

Everything lives in a `trips` table in Supabase: `slug`, `title`, `summary`, `content`, `cover_image_url`, `destination`, `country`, `trip_date`, `tags[]`, `published`.

Images are stored in the `travel-blog-images` Supabase Storage bucket, automatically compressed to WebP before upload.

---

## Technical docs

- [`docs/public-pages.md`](docs/public-pages.md) — public pages and SEO
- [`docs/admin.md`](docs/admin.md) — admin interface and authentication
- [`docs/data-storage.md`](docs/data-storage.md) — data model, composables, image storage
