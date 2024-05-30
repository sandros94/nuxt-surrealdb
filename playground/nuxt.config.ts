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
  },
  devtools: { enabled: true },
})
