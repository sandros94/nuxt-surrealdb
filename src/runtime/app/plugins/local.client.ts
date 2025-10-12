// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { surrealdbWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import type { SurrealDatabaseOptions, SurrealEngineOptions } from '#surrealdb/types'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:local',
  enforce: 'pre',
  setup(nuxtApp) {
    const { local } = nuxtApp.$config.public.surrealdb as { local?: SurrealDatabaseOptions & { wasmEngine?: SurrealEngineOptions } }

    const client = new Surreal({
      engines: surrealdbWasmEngines(local?.wasmEngine),
    })

    return {
      provide: {
        surrealLocal: client,
      },
    }
  },
})
