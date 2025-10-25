import { type AuthProvider, Surreal, createRemoteEngines } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientRuntimeConfig,
  SurrealClientOptions,
} from '#surrealdb/types'
import { surrealHooks, onBeforeUnmount, useRuntimeConfig } from '#imports'

// #region public composable

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
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
  const { surrealdb } = useRuntimeConfig().public

  const config = (mergeConfig !== false
    ? defu(_options, surrealdb)
    : _options) as T & SurrealClientOptions

  const client = new Surreal({
    engines: createRemoteEngines(),
  })

  // Event Hooks
  const unsubConnecting = client.subscribe('connecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:connecting', { client, config })
  })
  // const unsubConnected = client.subscribe('connected', async () => {
  //   await surrealHooks.callHookParallel('surrealdb:connected', { client, config })
  // })
  const unsubReconnecting = client.subscribe('reconnecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:reconnecting', { client, config })
  })
  const unsubAuthenticated = client.subscribe('authenticated', async (token) => {
    await surrealHooks.callHookParallel('surrealdb:authenticated', { client, config, token })
  })
  const unsubDisconnected = client.subscribe('disconnected', async () => {
    await surrealHooks.callHookParallel('surrealdb:disconnected', { client, config })
  })
  const unsubError = client.subscribe('error', async (error) => {
    await surrealHooks.callHookParallel('surrealdb:error', { client, config, error })
  })
  const unsubInvalidated = client.subscribe('invalidated', async () => {
    await surrealHooks.callHookParallel('surrealdb:invalidated', { client, config })
  })
  const unsubUsing = client.subscribe('using', async ({ namespace, database }) => {
    await surrealHooks.callHookParallel('surrealdb:using', { client, config, namespace, database })
  })

  onBeforeUnmount(() => {
    unsubConnecting()
    // unsubConnected()
    unsubReconnecting()
    unsubAuthenticated()
    unsubDisconnected()
    unsubError()
    unsubInvalidated()
    unsubUsing()
    client.close().catch(() => {})
  })

  await surrealHooks.callHookParallel('surrealdb:init', { client, config })

  if (config.endpoint && config.autoConnect !== false) {
    let endpoint = config.endpoint

    if (import.meta.server) {
      // prefer http for SSR
      if (preferHttp !== false) {
        endpoint = endpoint.replace(/^ws/, 'http')
      }
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
      await surrealHooks.callHookParallel('surrealdb:connected', { client, config })
    }
  }

  return {
    client,
    config: config as any,
  }
}

// #endregion public composable
