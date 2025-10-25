import type { Surreal } from 'surrealdb'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealClientOptions,
} from '#surrealdb/types'
import { surrealHooks, onBeforeUnmount, useNuxtApp } from '#imports'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

export async function useSurrealMemory(options?: UseSurrealMemOptions): Promise<Surreal | null> {
  const {
    $surrealMemory,
    $config: { public: { surrealdb: { memory } = {} } = {} },
  } = useNuxtApp()

  if ($surrealMemory === null) {
    return null
  }

  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, memory)
    : opts) as SurrealClientOptions

  // Event Hooks
  const unsubConnecting = $surrealMemory.subscribe('connecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:connecting', { client: $surrealMemory, config })
  })
  // const unsubConnected = $surrealMemory.subscribe('connected', async () => {
  //   await surrealHooks.callHookParallel('surrealdb:memory:connected', { client: $surrealMemory, config })
  // })
  const unsubReconnecting = $surrealMemory.subscribe('reconnecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:reconnecting', { client: $surrealMemory, config })
  })
  const unsubAuthenticated = $surrealMemory.subscribe('authenticated', async (token) => {
    await surrealHooks.callHookParallel('surrealdb:memory:authenticated', { client: $surrealMemory, config, token })
  })
  const unsubDisconnected = $surrealMemory.subscribe('disconnected', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:disconnected', { client: $surrealMemory, config })
  })
  const unsubError = $surrealMemory.subscribe('error', async (error) => {
    await surrealHooks.callHookParallel('surrealdb:memory:error', { client: $surrealMemory, config, error })
  })
  const unsubInvalidated = $surrealMemory.subscribe('invalidated', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:invalidated', { client: $surrealMemory, config })
  })
  const unsubUsing = $surrealMemory.subscribe('using', async ({ namespace, database }) => {
    await surrealHooks.callHookParallel('surrealdb:memory:using', { client: $surrealMemory, config, namespace, database })
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
    $surrealMemory.close().catch(() => {})
  })

  await surrealHooks.callHookParallel('surrealdb:memory:init', { client: $surrealMemory, config })

  if (config.autoConnect !== false) {
    const isConnected = await $surrealMemory.connect('mem://', config.connectOptions)
    if (isConnected) {
      await surrealHooks.callHookParallel('surrealdb:memory:connected', { client: $surrealMemory, config })
    }
  }

  return $surrealMemory
}
