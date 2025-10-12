// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { surrealdbWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'

import type { SurrealDatabaseOptions, SurrealEngineOptions } from '#surrealdb/types'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { local } = nuxtApp.$config.public.surrealdb as { local?: SurrealDatabaseOptions & { wasmEngine?: SurrealEngineOptions } }

  const client = new Surreal({
    engines: surrealdbWasmEngines(local?.wasmEngine),
  })

  if (local?.endpoint) {
    // This is actually always true, because endpoint has a default value
    await client.connect(local.endpoint, local.connectOptions)
    // @ts-expect-error Nuxt hook not being recognized
    nuxtApp.callHook('surrealdb:local:connected', client, local)
  }

  return {
    provide: {
      surrealLocal: client,
    },
  }
})
