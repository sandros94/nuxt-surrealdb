// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import { defineNuxtPlugin, surrealHooks } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:memory',
  enforce: 'pre',
  parallel: true,
  async setup(nuxtApp) {
    const { memory: { wasmEngine, ...config } = {} } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createWasmEngines(wasmEngine),
    })

    await surrealHooks.callHookParallel('surrealdb:memory:init', { client, config })

    return {
      provide: {
        surrealMemory: client,
      },
    }
  },
})
