import { surrealdbNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
} from '#surrealdb/types'
import { useNitroApp, useRuntimeConfig } from '#imports'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealMem(event?: H3Event, options?: UseSurrealMemOptions): Promise<Surreal> {
  const { memory } = useRuntimeConfig(event).surrealdb as { memory?: SurrealDatabaseOptions & { nodeEngine?: SurrealEngineOptions } }
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, memory)
    : opts) as SurrealDatabaseOptions

  if (!client) {
    client = new Surreal({
      engines: surrealdbNodeEngines(memory?.nodeEngine),
    })
  }

  const { hooks } = useNitroApp()

  if (config?.endpoint) {
    await client.connect(config.endpoint, config.connectOptions)
    // @ts-expect-error Nitro hook not being recognized
    hooks.callHookParallel('surrealdb:memory:connected', client, config)
  }

  hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
