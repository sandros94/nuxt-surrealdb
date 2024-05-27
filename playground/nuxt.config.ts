export default defineNuxtConfig({
  alias: {
    'nuxt-surrealdb': '../src/module',
  },
  modules: ['nuxt-surrealdb'],
  surrealdb: {},
  devtools: { enabled: true },
})
