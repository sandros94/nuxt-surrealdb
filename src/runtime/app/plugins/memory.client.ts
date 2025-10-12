// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { surrealdbWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import type { SurrealDatabaseOptions, SurrealEngineOptions } from '#surrealdb/types'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { memory } = nuxtApp.$config.public.surrealdb as { memory?: SurrealDatabaseOptions & { wasmEngine?: SurrealEngineOptions } }

  const client = new Surreal({
    engines: surrealdbWasmEngines(memory?.wasmEngine),
  })

  if (memory?.endpoint) {
    // This is actually always true, because endpoint has a default value
    const isConnected = await client.connect(memory.endpoint, memory.connectOptions)
    if (isConnected)
      nuxtApp.callHook('surrealdb:memory:connected', client, memory)
  }

  return {
    provide: {
      surrealMem: client,
    },
  }
})
