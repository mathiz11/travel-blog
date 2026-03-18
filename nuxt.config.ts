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
      ],
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/trips/**": { prerender: true },
    "/admin/**": { ssr: false },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@pinia/nuxt"],
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
