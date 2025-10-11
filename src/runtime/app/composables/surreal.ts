import { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
  SurrealClientConfig,
} from '#surrealdb/types'
import { onBeforeUnmount, useRuntimeConfig } from '#imports'

// #region internal utils

function createClient(_config?: SurrealEngineOptions): Surreal {
  return new Surreal()
}

// #endregion internal utils

// #region public composable

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
  wasmEngine?: SurrealEngineOptions
  mergeConfig?: M
  preferHttp?: boolean
  autoConnect?: boolean
} & T
export interface UseSurrealReturn<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> {
  client: Surreal
  config: M extends false ? T : SurrealClientConfig<T>
}

export function useSurreal<M extends boolean, T extends SurrealDatabaseOptions>(options?: UseSurrealOptions<M, T>): UseSurrealReturn<M, T> {
  const { autoConnect, mergeConfig, preferHttp, ..._options } = options || {}
  const { surrealdb } = useRuntimeConfig().public

  const { wasmEngine, ...config } = (mergeConfig !== false
    ? defu(_options, surrealdb)
    : _options) as T & { wasmEngine?: SurrealEngineOptions }

  const client = createClient(wasmEngine)

  if (autoConnect !== false && config.endpoint) {
    let endpoint = config.endpoint

    if (import.meta.server) {
      // prefer http for SSR
      if (preferHttp !== false) {
        endpoint = endpoint.replace(/^ws/, 'http')
      }
    }

    client.connect(endpoint, config.connectOptions)
  }

  onBeforeUnmount(async () => {
    await client.close()
  })

  return {
    client,
    config: config as any,
  }
}

// #endregion public composable
