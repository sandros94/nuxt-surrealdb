import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
  SurrealServerConfig,
} from '#surrealdb/types'
import { useRuntimeConfig } from '#imports'

// #region internal utils

function createClient(_config?: SurrealEngineOptions): Surreal {
  return new Surreal()
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
  config: M extends false ? T : SurrealServerConfig<T>
}

export function useSurreal<M extends boolean, T extends SurrealDatabaseOptions>(event?: H3Event, options?: UseSurrealOptions<M, T>): UseSurrealReturn<M, T> {
  if (event?.context.surrealdb && event.context.surrealdb.client && event.context.surrealdb.config) {
    return {
      client: event.context.surrealdb.client,
      config: event.context.surrealdb.config as any,
    }
  }

  const { autoConnect, mergeConfig, preferHttp, ..._options } = options || {}
  const {
    public: { surrealdb: pubSurrealdb },
    surrealdb: srvSurrealdb,
  } = useRuntimeConfig(event)

  const { nodeEngine, ...config } = (mergeConfig !== false
    ? defu(_options, srvSurrealdb, pubSurrealdb)
    : _options) as T & { nodeEngine?: SurrealEngineOptions }

  const client = createClient(nodeEngine)

  if (autoConnect !== false && config.endpoint) {
    let endpoint = config.endpoint

    // prefer http
    if (preferHttp !== false) {
      endpoint = endpoint.replace(/^ws/, 'http')
    }

    client.connect(endpoint, config.connectOptions)
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
