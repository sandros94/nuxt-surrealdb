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
      await $surrealLocal.connect(config.endpoint, {
        ...config.connectOptions,
        authentication: () => {
          if (config.connectOptions?.authentication) {
            return typeof config.connectOptions.authentication === 'function'
              ? config.connectOptions.authentication()
              : config.connectOptions.authentication
          }

          // @ts-expect-error `callHook` is not able to infer the types properly
          return surrealHooks.callHook('surrealdb:local:authentication', { client: $surrealLocal, config })
        },
      })
    }
  }

  return $surrealLocal
}
