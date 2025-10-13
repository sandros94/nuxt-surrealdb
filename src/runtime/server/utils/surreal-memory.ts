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
  client = new Surreal({
    engines: createNodeEngines(memory?.nodeEngine),
  })

  useNitroApp().hooks.hook('close', async () => {
    if (client !== null) {
      await client.close()
    }
  })

  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, memory)
    : opts) as SurrealServerOptions

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
