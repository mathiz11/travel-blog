// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
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
