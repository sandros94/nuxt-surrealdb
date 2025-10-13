import type { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientOptions,
} from '#surrealdb/types'
import { surrealHooks, onBeforeUnmount, useNuxtApp } from '#imports'

export interface UseSurrealLocalOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

export async function useSurrealLocal(options?: UseSurrealLocalOptions): Promise<Surreal | null> {
  const {
    $surrealLocal,
    $config: { public: { surrealdb: { local } = {} } = {} },
  } = useNuxtApp()

  onBeforeUnmount(() => {
    if ($surrealLocal !== null)
      $surrealLocal.close().catch(() => {})
  })

  if ($surrealLocal !== null) {
    const { mergeConfig, ...opts } = options || {}
    const config = (mergeConfig !== false
      ? defu(opts, local)
      : opts) as SurrealClientOptions

    await surrealHooks.callHookParallel('surrealdb:local:init', { client: $surrealLocal, config })

    if (config?.endpoint && config.autoConnect !== false) {
      const isConnected = await $surrealLocal.connect(config.endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:local:connected', { client: $surrealLocal, config })
      }
    }
  }

  return $surrealLocal
}
