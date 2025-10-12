import { surrealdbNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
  SurrealServerRuntimeConfig,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useNitroApp } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'

// #region internal utils

function createClient(config?: SurrealEngineOptions): Surreal {
  return new Surreal({
    engines: surrealdbNodeEngines(config),
  })
}

// #endregion internal utils

// #region public composable

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
  nodeEngine?: SurrealEngineOptions
  mergeConfig?: M
  preferHttp?: boolean
  autoConnect?: boolean
} & T
export interface UseSurrealReturn<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> {
  client: Surreal
  config: M extends false ? T : SurrealServerRuntimeConfig<T>
}

export async function useSurreal<M extends boolean, T extends SurrealDatabaseOptions>(event?: H3Event, options?: UseSurrealOptions<M, T>): Promise<UseSurrealReturn<M, T>> {
  if (event?.context.surrealdb && event.context.surrealdb.client && event.context.surrealdb.config) {
    return {
      client: event.context.surrealdb.client,
      config: event.context.surrealdb.config as any,
    }
  }

  const { mergeConfig, preferHttp, ..._options } = options || {}
  const {
    public: { surrealdb: pubSurrealdb },
    surrealdb: srvSurrealdb,
  } = useRuntimeConfig(event)

  const { nodeEngine, ...config } = (mergeConfig !== false
    ? defu(_options, srvSurrealdb, pubSurrealdb)
    : _options) as T & SurrealServerOptions

  const client = createClient(nodeEngine)

  if (config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    // prefer http
    if (preferHttp !== false) {
      endpoint = endpoint.replace(/^ws/, 'http')
    }

    const isConnected = await client.connect(endpoint, config.connectOptions)
    if (isConnected)
      useNitroApp().hooks.callHookParallel('surrealdb:connected', client, config)
  }

  if (event) {
    event.context.surrealdb = {
      client,
      config,
    }
  }

  return {
    client,
    config: config as any,
  }
}

// #endregion public composable

declare module 'h3' {
  interface H3EventContext {
    surrealdb?: {
      client: Surreal
      config: SurrealDatabaseOptions
    }
  }
}
