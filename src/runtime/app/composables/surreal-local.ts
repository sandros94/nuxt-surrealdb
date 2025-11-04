import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

export async function useSurrealLocal(): Promise<Surreal | null> {
  const {
    $surrealLocal: client,
    $config: { public: { surrealdb: { local: { wasmEngine, ...config } = {} } = {} } = {} },
  } = useNuxtApp()

  if (client === null) {
    return null
  }

  if (!client.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:local:connecting', { client, config })

    if (config?.endpoint && config.autoConnect !== false) {
      const isConnected = await client.connect(config.endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:local:connected', { client })
      }
    }
  }

  return client
}
