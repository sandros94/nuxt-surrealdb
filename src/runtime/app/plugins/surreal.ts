// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createRemoteEngines, Surreal, Value } from 'surrealdb'
import { markRaw } from 'vue'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:client',
  enforce: 'pre',
  parallel: true,
  setup() {
    const client = new Surreal({
      engines: createRemoteEngines(),
      codecOptions: {
        valueDecodeVisitor: value => value instanceof Value ? markRaw(value) : value,
      },
    })

    return {
      provide: {
        surreal: client,
      },
    }
  },
})
