import { surrealdbNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useNitroApp } from 'nitropack/runtime'
import { useRuntimeConfig } from '#imports'

export interface UseSurrealLocalOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealLocal(event?: H3Event, options?: UseSurrealLocalOptions): Promise<Surreal> {
  const { local } = useRuntimeConfig(event).surrealdb!
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, local)
    : opts) as SurrealServerOptions

  if (!client) {
    client = new Surreal({
      engines: surrealdbNodeEngines(local?.nodeEngine),
    })
  }

  const { hooks } = useNitroApp()

  await hooks.callHookParallel('surrealdb:local:init', client, config)

  if (config?.endpoint && config.autoConnect !== false) {
    const isConnected = await client.connect(config.endpoint, config.connectOptions)
    if (isConnected)
      hooks.callHookParallel('surrealdb:local:connected', client, config)
  }

  hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
