export default defineNuxtConfig({
  modules: [
    'comark/nuxt',
    '@nuxt/ui',
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
      local: {
        endpoint: 'indxdb://surrealdb',
      },
      connectOptions: {
        authentication: {
          username: '',
          password: '',
        },
      },
    },
    server: {
      local: {
        endpoint: 'surrealkv://./.data/db',
      },
    },
  },
})
