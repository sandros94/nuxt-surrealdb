// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:memory',
  enforce: 'pre',
  parallel: true,
  setup(nuxtApp) {
    const { memory: { wasmEngine } = {} } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createWasmEngines(wasmEngine),
    })

    return {
      provide: {
        surrealMemory: client,
      },
    }
  },
})
