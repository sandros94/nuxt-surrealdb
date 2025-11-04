// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { Surreal, createRemoteEngines } from 'surrealdb'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:client',
  enforce: 'pre',
  setup() {
    const client = new Surreal({
      engines: createRemoteEngines(),
    })

    return {
      provide: {
        surreal: client,
      },
    }
  },
})
