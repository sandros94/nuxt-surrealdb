export default defineNuxtConfig({
  modules: ['../src/module'],
  surrealdb: {
    auth: {
      database: 'staging',
    },
    databases: {
      staging: {},
      nasa: {
        host: 'https://surrealdb.s94.dev',
        ws: 'wss://surrealdb.s94.dev',
        NS: 'demo',
        DB: 'nasa',
      },
      example: {},
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
