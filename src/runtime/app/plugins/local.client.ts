// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:local',
  enforce: 'pre',
  setup(nuxtApp) {
    const { local } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createWasmEngines(local?.wasmEngine),
    })

    return {
      provide: {
        surrealLocal: client,
      },
    }
  },
})
