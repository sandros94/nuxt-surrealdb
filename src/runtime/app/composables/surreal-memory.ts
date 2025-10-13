import type { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientOptions,
} from '#surrealdb/types'
import { onBeforeUnmount, useNuxtApp } from '#imports'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

export async function useSurrealMem(options?: UseSurrealMemOptions): Promise<Surreal | null> {
  const {
    $surrealMemory,
    hooks,
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

    await hooks.callHookParallel('surrealdb:memory:init', { client: $surrealMemory, config })

    if (config.autoConnect !== false) {
      await $surrealMemory.connect('mem://', {
        ...config.connectOptions,
        // @ts-expect-error `callHook` is not able to infer the types properly
        authentication: config.connectOptions?.authentication || await hooks.callHook('surrealdb:memory:authentication', { client: $surrealMemory, config }),
      })
    }
  }

  return $surrealMemory
}
