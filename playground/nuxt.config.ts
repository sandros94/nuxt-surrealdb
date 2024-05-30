export default defineNuxtConfig({
  alias: {
    'nuxt-surrealdb': '../src/module',
  },
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      staging: {},
    },
  },
  devtools: { enabled: true },
})
