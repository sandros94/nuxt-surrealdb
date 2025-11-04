// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:memory',
  enforce: 'pre',
  parallel: true,
  setup() {
    return {
      provide: {
        surrealMemory: null,
      },
    }
  },
})
