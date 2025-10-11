import { surrealdbNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
} from '#surrealdb/types'
import { useNitroApp, useRuntimeConfig } from '#imports'

export interface UseSurrealLocalOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealLocal(event?: H3Event, options?: UseSurrealLocalOptions): Promise<Surreal> {
  const { local } = useRuntimeConfig(event).surrealdb as { local?: SurrealDatabaseOptions & { nodeEngine?: SurrealEngineOptions } }
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, local)
    : opts) as SurrealDatabaseOptions

  if (!client) {
    client = new Surreal({
      engines: surrealdbNodeEngines(local?.nodeEngine),
    })
  }

  const { hooks } = useNitroApp()

  if (config?.endpoint) {
    await client.connect(config.endpoint, config.connectOptions)
    // @ts-expect-error Nitro hook not being recognized
    hooks.callHookParallel('surrealdb:local:connected', client, config)
  }

  hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
