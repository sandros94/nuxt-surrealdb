import type { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientOptions,
} from '#surrealdb/types'
import { onBeforeUnmount, useNuxtApp } from '#imports'

export interface UseSurrealLocalOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

export async function useSurrealLocal(options?: UseSurrealLocalOptions): Promise<Surreal | null> {
  const {
    $surrealLocal,
    hooks,
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

    await hooks.callHookParallel('surrealdb:local:init', { client: $surrealLocal, config })

    if (config?.endpoint && config.autoConnect !== false) {
      await $surrealLocal.connect(config.endpoint, {
        ...config.connectOptions,
        // @ts-expect-error `callHook` is not able to infer the types properly
        authentication: config.connectOptions?.authentication || await hooks.callHook('surrealdb:local:authentication', { client: $surrealLocal, config }),
      })
    }
  }

  return $surrealLocal
}
