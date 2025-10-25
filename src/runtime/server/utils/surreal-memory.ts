import { createNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useNitroApp } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealMemory(event?: H3Event, options?: UseSurrealMemOptions): Promise<Surreal> {
  if (client !== null) {
    return client
  }

  const { memory } = useRuntimeConfig(event).surrealdb!
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, memory)
    : opts) as SurrealServerOptions

  client = new Surreal({
    engines: createNodeEngines(memory?.nodeEngine),
  })

  // Event Hooks
  const unsubConnecting = client.subscribe('connecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:connecting', { client: client!, config, event })
  })
  // Not used in favor 'surrealdb:connected' manual hook (which makes queries wait for hook to finish)
  // const unsubConnected = client.subscribe('connected', async () => {
  //   await surrealHooks.callHookParallel('surrealdb:memory:connected', { client: client!, config, event })
  // })
  const unsubReconnecting = client.subscribe('reconnecting', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:reconnecting', { client: client!, config, event })
  })
  const unsubAuthenticated = client.subscribe('authenticated', async (token) => {
    await surrealHooks.callHookParallel('surrealdb:memory:authenticated', { client: client!, config, event, token })
  })
  const unsubDisconnected = client.subscribe('disconnected', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:disconnected', { client: client!, config, event })
  })
  const unsubError = client.subscribe('error', async (error) => {
    await surrealHooks.callHookParallel('surrealdb:memory:error', { client: client!, config, event, error })
  })
  const unsubInvalidated = client.subscribe('invalidated', async () => {
    await surrealHooks.callHookParallel('surrealdb:memory:invalidated', { client: client!, config, event })
  })
  const unsubUsing = client.subscribe('using', async ({ namespace, database }) => {
    await surrealHooks.callHookParallel('surrealdb:memory:using', { client: client!, config, event, namespace, database })
  })

  useNitroApp().hooks.hook('close', async () => {
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

  try {
    await surrealHooks.callHookParallel('surrealdb:memory:init', { client, config, event })

    if (config.autoConnect !== false) {
      const isConnected = await client.connect('mem://', config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:memory:connected', { client, config, event })
      }
    }
  }
  catch (error_) {
    client = null
    throw error_
  }

  return client
}
