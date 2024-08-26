export default defineNuxtConfig({
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
      example: {
        DB: '',
      },
    },
    server: {
      databases: {
        staging: {
          auth: {
            user: '',
            pass: '',
          },
        },
        example: {
          host: 'http://localhost:8000',
          ws: 'http://localhost:8000',
        },
      },
    },
  },
  devtools: { enabled: true },
  imports: { autoImport: true },
  compatibilityDate: '2024-08-22',
})
