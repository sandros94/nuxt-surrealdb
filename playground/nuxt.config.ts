export default defineNuxtConfig({
  alias: {
    'nuxt-surrealdb': '../src/module',
  },
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    auth: {
      database: 'staging',
    },
    databases: {
      staging: {
        host: '',
        ws: '',
        NS: '',
        DB: '',
        SC: '',
      },
      nasa: {
        host: 'https://surrealdb.s94.dev',
        ws: 'wss://surrealdb.s94.dev',
        NS: 'demo',
        DB: 'nasa',
      },
    },
    server: {
      databases: {
        staging: {
          auth: '',
        },
      },
    },
  },
  devtools: { enabled: true },
  imports: { autoImport: true },
  compatibilityDate: '2024-07-10',
})
