import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

export async function useSurrealMemory(): Promise<Surreal | null> {
  const {
    $surrealMemory: client,
    $config: { public: { surrealdb: { memory: { wasmEngine, ...config } = {} } = {} } = {} },
  } = useNuxtApp()

  if (client === null) {
    return null
  }

  if (!client.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:memory:connecting', { client, config })

    if (config?.autoConnect !== false) {
      const isConnected = await client.connect('mem://', config?.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:memory:connected', { client })
      }
    }
  }

  return client
}
