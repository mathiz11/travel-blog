// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        noUncheckedIndexedAccess: true,
        noImplicitOverride: true,
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "zod",
        "browser-image-compression",
        "@tiptap/vue-3",
        "@tiptap/starter-kit",
        "leaflet",
        "leaflet-gpx",
        "d3-geo",
      ],
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/trips/**": { prerender: true },
    "/admin/**": { ssr: false },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  runtimeConfig: {
    // Clé service role Supabase — insertion des commentaires côté serveur uniquement
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
    public: {
      thunderforestApiKey: process.env.THUNDERFOREST_API_KEY ?? "",
    },
  },
  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY ?? "",
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@pinia/nuxt", "@nuxtjs/turnstile"],
  css: ["~/assets/css/main.css"],
  supabase: {
    redirectOptions: {
      login: "/admin/login",
      callback: "/confirm",
      include: ["/admin(/*)?"],
      exclude: ["/admin/login"],
      saveRedirectToCookie: true,
    },
  },
});
