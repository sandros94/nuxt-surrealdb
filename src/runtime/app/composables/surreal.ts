import type { Surreal } from 'surrealdb'

import { surrealHooks, useNuxtApp } from '#imports'

// #region public composable

export async function useSurreal(): Promise<Surreal> {
  const {
    $surreal: client,
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

  if (!client.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:connecting', { client, config })

    if (config.endpoint && config.autoConnect !== false) {
      let endpoint = config.endpoint

      // prefer http during server-side rendering
      if (import.meta.server && config.preferHttp !== false) {
        endpoint = endpoint.replace(/^ws/, 'http')
      }

      const isConnected = await client.connect(endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:connected', { client })
      }
    }
  }

  return client
}

// #endregion public composable
