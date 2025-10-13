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
  const { local } = useRuntimeConfig(event).surrealdb!
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, local)
    : opts) as SurrealServerOptions

  if (!client) {
    client = new Surreal({
      engines: createNodeEngines(local?.nodeEngine),
    })
  }

  await surrealHooks.callHookParallel('surrealdb:local:init', { client, config, event })

  if (config?.endpoint && config.autoConnect !== false) {
    await client.connect(config.endpoint, config.connectOptions)
  }

  useNitroApp().hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
