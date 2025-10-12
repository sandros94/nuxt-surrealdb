import { surrealdbWasmEngines } from '@surrealdb/wasm'
import { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
  SurrealClientRuntimeConfig,
  SurrealClientOptions,
} from '#surrealdb/types'
import { onBeforeUnmount, useNuxtApp } from '#imports'

// #region internal utils

function createClient(config?: SurrealEngineOptions): Surreal {
  return new Surreal({
    engines: surrealdbWasmEngines(config),
  })
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
  config: M extends false ? T : SurrealClientRuntimeConfig<T>
}

export async function useSurreal<M extends boolean, T extends SurrealDatabaseOptions>(options?: UseSurrealOptions<M, T>): Promise<UseSurrealReturn<M, T>> {
  const { mergeConfig, preferHttp, ..._options } = options || {}
  const { $config: { public: { surrealdb } }, hooks } = useNuxtApp()

  const { wasmEngine, ...config } = (mergeConfig !== false
    ? defu(_options, surrealdb)
    : _options) as T & SurrealClientOptions

  const client = createClient(wasmEngine)

  onBeforeUnmount(() => {
    client.close().catch(() => {})
  })

  await hooks.callHookParallel('surrealdb:init', client, config)

  if (config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    if (import.meta.server) {
      if (endpoint.startsWith('mem://') || endpoint.startsWith('indxdb://')) {
        // Throw, as these engines are not supported in SSR
        throw new Error(`[SurrealDB] The "${endpoint.split('://')[0]}://" engine is not supported in SSR context.`)
      }

      // prefer http for SSR
      if (preferHttp !== false) {
        endpoint = endpoint.replace(/^ws/, 'http')
      }
    }

    const isConnected = await client.connect(endpoint, config.connectOptions)
    if (isConnected)
      hooks.callHookParallel('surrealdb:connected', client, config)
  }

  return {
    client,
    config: config as any,
  }
}

// #endregion public composable
