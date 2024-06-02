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
  imports: {
    autoImport: true,
  },
})
