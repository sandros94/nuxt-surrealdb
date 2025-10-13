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

  const { hooks } = useNitroApp()

  await hooks.callHookParallel('surrealdb:local:init', { client, config })

  if (config?.endpoint && config.autoConnect !== false) {
    await client.connect(config.endpoint, {
      ...config.connectOptions,
      // @ts-expect-error `callHook` is not able to infer the types properly
      authentication: config.connectOptions?.authentication || await hooks.callHook('surrealdb:local:authentication', { client, config }),
    })
  }

  hooks.hook('close', async () => {
    if (client) {
      await client.close()
    }
  })

  return client
}
