// https://nuxt.com/docs/guide/directory-structure/nuxt.config#nuxt-config-file
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '../src/module',
  ],
  imports: { autoImport: true },

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-09-30',

  surrealdb: {
    autoImportExpressions: true,
    client: {
      connectOptions: {
        authentication: {
          username: '',
          password: '',
        },
      },
    },
  },
})
