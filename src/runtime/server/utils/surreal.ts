import { type AuthProvider, Surreal, createRemoteEngines } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealServerRuntimeConfig,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useNitroApp, useRuntimeConfig } from '#imports'

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

  const client = new Surreal({
    engines: createRemoteEngines(),
  })

  // Event Hooks
  const unsubConnecting = client.subscribe('connecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:connecting', { client, config, event })
  })
  // Not used in favor 'surrealdb:connected' manual hook (which makes queries wait for hook to finish)
  // const unsubConnected = client.subscribe('connected', async () => {
  //   await surrealHooks.callHookParallel('surrealdb:connected', { client, config, event })
  // })
  const unsubReconnecting = client.subscribe('reconnecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:reconnecting', { client, config, event })
  })
  const unsubAuthenticated = client.subscribe('authenticated', async (token) => {
    await surrealHooks.callHookParallel('surrealdb:authenticated', { client, config, event, token })
  })
  const unsubDisconnected = client.subscribe('disconnected', async () => {
    await surrealHooks.callHookParallel('surrealdb:disconnected', { client, config, event })
  })
  const unsubError = client.subscribe('error', async (error) => {
    await surrealHooks.callHookParallel('surrealdb:error', { client, config, event, error })
  })
  const unsubInvalidated = client.subscribe('invalidated', async () => {
    await surrealHooks.callHookParallel('surrealdb:invalidated', { client, config, event })
  })
  const unsubUsing = client.subscribe('using', async ({ namespace, database }) => {
    await surrealHooks.callHookParallel('surrealdb:using', { client, config, event, namespace, database })
  })

  const { hooks } = useNitroApp()
  hooks.hook('afterResponse', async (event) => {
    if (event.context.surrealdb) {
      const client = event.context.surrealdb.client
      unsubConnecting()
      // unsubConnected()
      unsubReconnecting()
      unsubAuthenticated()
      unsubDisconnected()
      unsubError()
      unsubInvalidated()
      unsubUsing()
      await client.close()
      event.context.surrealdb = undefined
    }
  })
  hooks.hook('close', async () => {
    if (client !== null) {
      unsubConnecting()
      // unsubConnected()
      unsubReconnecting()
      unsubAuthenticated()
      unsubDisconnected()
      unsubError()
      unsubInvalidated()
      unsubUsing()
      await client.close()
    }
  })

  await surrealHooks.callHookParallel('surrealdb:init', { client, config, event })

  if (config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    // prefer http
    if (preferHttp !== false) {
      endpoint = endpoint.replace(/^ws/, 'http')
    }

    const authentication: AuthProvider = options?.connectOptions?.authentication
      ? config.connectOptions!.authentication
      // @ts-expect-error `callHook` is not able to infer the types properly
      : (await surrealHooks.callHook('surrealdb:init:authentication', { client, config }) || config.connectOptions?.authentication)

    const isConnected = await client.connect(endpoint, {
      ...config.connectOptions,
      authentication,
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
