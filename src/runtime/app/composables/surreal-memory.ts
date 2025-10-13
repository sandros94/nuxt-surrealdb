import type { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientOptions,
} from '#surrealdb/types'
import { surrealHooks, onBeforeUnmount, useNuxtApp } from '#imports'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

export async function useSurrealMemory(options?: UseSurrealMemOptions): Promise<Surreal | null> {
  const {
    $surrealMemory,
    $config: { public: { surrealdb: { memory } = {} } = {} },
  } = useNuxtApp()

  onBeforeUnmount(() => {
    if ($surrealMemory !== null)
      $surrealMemory.close().catch(() => {})
  })

  if ($surrealMemory !== null) {
    const { mergeConfig, ...opts } = options || {}
    const config = (mergeConfig !== false
      ? defu(opts, memory)
      : opts) as SurrealClientOptions

    await surrealHooks.callHookParallel('surrealdb:memory:init', { client: $surrealMemory, config })

    if (config.autoConnect !== false) {
      const isConnected = await $surrealMemory.connect('mem://', config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:memory:connected', { client: $surrealMemory, config })
      }
    }
  }

  return $surrealMemory
}
