// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:local',
  enforce: 'pre',
  setup() {
    return {
      provide: {
        surrealLocal: null,
      },
    }
  },
})
