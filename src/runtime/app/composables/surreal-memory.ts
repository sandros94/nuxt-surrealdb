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

export async function useSurrealMem(options?: UseSurrealMemOptions): Promise<Surreal | null> {
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
      await $surrealMemory.connect('mem://', config.connectOptions)
    }
  }

  return $surrealMemory
}
