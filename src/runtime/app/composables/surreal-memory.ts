import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

export async function useSurrealMemory(): Promise<Surreal | null> {
  const {
    $surrealMemory,
    $config: { public: { surrealdb: { memory: config } = {} } = {} },
  } = useNuxtApp()

  if ($surrealMemory === null) {
    return null
  }

  if (!$surrealMemory.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:memory:init', { client: $surrealMemory })

    if (config?.autoConnect !== false) {
      const isConnected = await $surrealMemory.connect('mem://', config?.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:memory:connected', { client: $surrealMemory })
      }
    }
  }

  return $surrealMemory
}
