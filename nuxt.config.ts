// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    devtools: { enabled: false },
    modules: [
      "@nuxtjs/supabase",
      "@vueuse/nuxt",
      "@element-plus/nuxt",
      "@nuxt/ui",
      "@nuxtjs/mdc",
    ],
});