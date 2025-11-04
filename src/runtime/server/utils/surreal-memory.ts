import { type SurrealSession, Surreal, Features } from 'surrealdb'
import { createNodeEngines } from '@surrealdb/node'
import type { H3Event } from 'h3'

import { useNitroApp, useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

import {
  H3_CONTEXT_SURREAL_MEMORY,
} from '#surrealdb/internal'

// #region public composable

let client: Surreal | null = null
export async function useSurrealMemory(event?: undefined): Promise<Surreal>
export async function useSurrealMemory(event: H3Event): Promise<SurrealSession>
export async function useSurrealMemory(event?: H3Event | undefined): Promise<Surreal | SurrealSession> {
  if (event && event.context[H3_CONTEXT_SURREAL_MEMORY] && event.context[H3_CONTEXT_SURREAL_MEMORY].isValid) {
    return event.context[H3_CONTEXT_SURREAL_MEMORY]
  }

  const { hooks } = useNitroApp()
  const { surrealdb: {
    memory: {
      nodeEngine,
      ...config
    } = {},
  } = {} } = useRuntimeConfig(event)

  if (!client) {
    client = new Surreal({
      engines: createNodeEngines(nodeEngine),
    })
  }

  if (!client.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:memory:connecting', { client, config })

    if (config.autoConnect !== false) {
      const isConnected = await client.connect('mem://', config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:memory:connected', { client })
      }
    }
  }

  if (!event) {
    return client
  }

  if (!client.isFeatureSupported(Features.Sessions)) {
    // TODO: throw error once a stable v2 is released
    console.warn('[nuxt-surrealdb] Sessions are not supported by this SurrealDB Node engine.')
    return client
  }

  const session = await client[config.session === 'fork' ? 'forkSession' : 'newSession']()
  event.context.surrealdb = session

  await surrealHooks.callHookParallel('surrealdb:memory:session:init', { session, event })

  hooks.hook('afterResponse', async (event) => {
    if (event.context[H3_CONTEXT_SURREAL_MEMORY]) {
      await event.context[H3_CONTEXT_SURREAL_MEMORY].closeSession()
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete event.context[H3_CONTEXT_SURREAL_MEMORY]
    }
  })

  return session
}

// #endregion public composable

declare module 'h3' {
  interface H3EventContext {
    [H3_CONTEXT_SURREAL_MEMORY]?: SurrealSession
  }
}
