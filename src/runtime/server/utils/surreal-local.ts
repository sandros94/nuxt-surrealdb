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

export interface UseSurrealLocalOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealLocal(event?: H3Event, options?: UseSurrealLocalOptions): Promise<Surreal> {
  if (client !== null) {
    return client
  }
  const { local } = useRuntimeConfig(event).surrealdb!
  client = new Surreal({
    engines: createNodeEngines(local?.nodeEngine),
  })

  useNitroApp().hooks.hook('close', async () => {
    if (client !== null) {
      await client.close()
    }
  })

  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, local)
    : opts) as SurrealServerOptions

  try {
    await surrealHooks.callHookParallel('surrealdb:local:init', { client, config, event })

    if (config?.endpoint && config.autoConnect !== false) {
      const isConnected = await client.connect(config.endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:local:connected', { client, config, event })
      }
    }
  }
  catch (error_) {
    client = null
    throw error_
  }

  return client
}
