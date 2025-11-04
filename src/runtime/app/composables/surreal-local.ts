import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

export async function useSurrealLocal(): Promise<Surreal | null> {
  const {
    $surrealLocal,
    $config: { public: { surrealdb: { local: config } = {} } = {} },
  } = useNuxtApp()

  if ($surrealLocal === null) {
    return null
  }

  if (!$surrealLocal.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:local:init', { client: $surrealLocal })

    if (config?.endpoint && config.autoConnect !== false) {
      const isConnected = await $surrealLocal.connect(config.endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:local:connected', { client: $surrealLocal })
      }
    }
  }

  return $surrealLocal
}
