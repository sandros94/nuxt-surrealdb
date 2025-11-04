import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

// #region public composable

export async function useSurreal(): Promise<Surreal> {
  const {
    $surreal,
    $config: {
      public: {
        surrealdb: {
          local,
          memory,
          ...config
        } = {},
      },
    },
  } = useNuxtApp()

  if (!$surreal.isConnected && config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    // prefer http during server-side rendering
    if (import.meta.server && config.preferHttp !== false) {
      endpoint = endpoint.replace(/^ws/, 'http')
    }

    const isConnected = await $surreal.connect(endpoint, config.connectOptions)
    if (isConnected) {
      await surrealHooks.callHookParallel('surrealdb:connected', { client: $surreal })
    }
  }

  return $surreal
}

// #endregion public composable
