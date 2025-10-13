import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealServerRuntimeConfig,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

// #region public composable

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
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

  const config = (mergeConfig !== false
    ? defu(_options, srvSurrealdb, pubSurrealdb)
    : _options) as T & SurrealServerOptions

  const client = new Surreal()

  await surrealHooks.callHookParallel('surrealdb:init', { client, config, event })

  if (config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    // prefer http
    if (preferHttp !== false) {
      endpoint = endpoint.replace(/^ws/, 'http')
    }

    const isConnected = await client.connect(endpoint, {
      ...config.connectOptions,
      authentication: () => {
        if (config.connectOptions?.authentication) {
          return typeof config.connectOptions.authentication === 'function'
            ? config.connectOptions.authentication()
            : config.connectOptions.authentication
        }

        // @ts-expect-error `callHook` is not able to infer the types properly
        return surrealHooks.callHook('surrealdb:authentication', { client, config, event })
      },
    })
    if (isConnected) {
      await surrealHooks.callHookParallel('surrealdb:connected', { client, config, event })
    }
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
