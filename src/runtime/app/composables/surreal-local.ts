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

  if ($surrealLocal === null) {
    return null
  }

  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, local)
    : opts) as SurrealClientOptions

  // Event Hooks
  const unsubConnecting = $surrealLocal.subscribe('connecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:local:connecting', { client: $surrealLocal, config })
  })
  // Not used in favor 'surrealdb:connected' manual hook (which makes queries wait for hook to finish)
  // const unsubConnected = $surrealLocal.subscribe('connected', async () => {
  //   await surrealHooks.callHookParallel('surrealdb:local:connected', { client: $surrealLocal, config })
  // })
  const unsubReconnecting = $surrealLocal.subscribe('reconnecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:local:reconnecting', { client: $surrealLocal, config })
  })
  const unsubAuthenticated = $surrealLocal.subscribe('authenticated', async (token) => {
    await surrealHooks.callHookParallel('surrealdb:local:authenticated', { client: $surrealLocal, config, token })
  })
  const unsubDisconnected = $surrealLocal.subscribe('disconnected', async () => {
    await surrealHooks.callHookParallel('surrealdb:local:disconnected', { client: $surrealLocal, config })
  })
  const unsubError = $surrealLocal.subscribe('error', async (error) => {
    await surrealHooks.callHookParallel('surrealdb:local:error', { client: $surrealLocal, config, error })
  })
  const unsubInvalidated = $surrealLocal.subscribe('invalidated', async () => {
    await surrealHooks.callHookParallel('surrealdb:local:invalidated', { client: $surrealLocal, config })
  })
  const unsubUsing = $surrealLocal.subscribe('using', async ({ namespace, database }) => {
    await surrealHooks.callHookParallel('surrealdb:local:using', { client: $surrealLocal, config, namespace, database })
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
    $surrealLocal.close().catch(() => {})
  })

  await surrealHooks.callHookParallel('surrealdb:local:init', { client: $surrealLocal, config })

  if (config?.endpoint && config.autoConnect !== false) {
    const isConnected = await $surrealLocal.connect(config.endpoint, config.connectOptions)
    if (isConnected) {
      await surrealHooks.callHookParallel('surrealdb:local:connected', { client: $surrealLocal, config })
    }
  }

  return $surrealLocal
}
