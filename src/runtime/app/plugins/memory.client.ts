// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { surrealdbWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import type { SurrealDatabaseOptions, SurrealEngineOptions } from '#surrealdb/types'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:memory',
  enforce: 'pre',
  setup(nuxtApp) {
    const { memory } = nuxtApp.$config.public.surrealdb as { memory?: SurrealDatabaseOptions & { wasmEngine?: SurrealEngineOptions } }

    const client = new Surreal({
      engines: surrealdbWasmEngines(memory?.wasmEngine),
    })

    return {
      provide: {
        surrealMem: client,
      },
    }
  },
})
