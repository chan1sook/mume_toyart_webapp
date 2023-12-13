// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["nuxt-icon"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      USE_DEVCHAIN: true,
      CHAIN_VERSION: 3,
    },
  },
  build: {
    transpile: ["vue-toastification"],
  },
  nitro: {
    routeRules: {
      "/mapi/**": { proxy: "http://localhost:3064/**", prerender: true },
    },
  },
});
