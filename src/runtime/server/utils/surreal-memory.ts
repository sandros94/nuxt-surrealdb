import { createNodeEngines } from '@surrealdb/node'
import { Surreal } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealServerOptions,
} from '#surrealdb/types'
import { useNitroApp } from 'nitropack/runtime'
import { surrealHooks, useRuntimeConfig } from '#imports'

export interface UseSurrealMemOptions extends SurrealDatabaseOptions {
  mergeConfig?: boolean
}

let client: Surreal | null = null
export async function useSurrealMem(event?: H3Event, options?: UseSurrealMemOptions): Promise<Surreal> {
  const { memory } = useRuntimeConfig(event).surrealdb!
  const { mergeConfig, ...opts } = options || {}
  const config = (mergeConfig !== false
    ? defu(opts, memory)
    : opts) as SurrealServerOptions

  if (!client) {
    client = new Surreal({
      engines: createNodeEngines(memory?.nodeEngine),
    })
  }

  await surrealHooks.callHookParallel('surrealdb:memory:init', { client, config })

  if (config.autoConnect !== false) {
    await client.connect('mem://', config.connectOptions)
  }

  useNitroApp().hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
