export default defineNuxtConfig({
  alias: {
    'nuxt-surrealdb': '../src/module',
  },
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      staging: {
        host: '',
        NS: '',
        DB: '',
        auth: '',
      },
    },
    auth: {
      database: 'staging',
    },
  },
  devtools: { enabled: true },
})
