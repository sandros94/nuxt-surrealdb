import { type SurrealSession, Surreal, Features } from 'surrealdb'
import { createNodeEngines } from '@surrealdb/node'
import type { H3Event } from 'h3'

import { useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

import {
  H3_CONTEXT_SURREAL_LOCAL,
} from '../internal'

// #region public composable

let client: Surreal | null = null
export async function useSurrealLocal(event?: undefined): Promise<Surreal>
export async function useSurrealLocal(event: H3Event): Promise<SurrealSession>
export async function useSurrealLocal(event?: H3Event | undefined): Promise<Surreal | SurrealSession> {
  if (event && event.context[H3_CONTEXT_SURREAL_LOCAL] && event.context[H3_CONTEXT_SURREAL_LOCAL].isValid) {
    return event.context[H3_CONTEXT_SURREAL_LOCAL]
  }

  const { surrealdb: {
    local: {
      nodeEngine,
      ...config
    } = {},
  } = {} } = useRuntimeConfig(event)

  if (!client) {
    client = new Surreal({
      engines: createNodeEngines(nodeEngine),
    })

    if (!client.isConnected) {
      await surrealHooks.callHookParallel('surrealdb:local:connecting', { client, config })

      if (config.endpoint && config.autoConnect !== false) {
        const isConnected = await client.connect(config.endpoint, config.connectOptions)
        if (isConnected) {
          await surrealHooks.callHookParallel('surrealdb:local:connected', { client })
        }
      }
    }
  }

  if (!event) {
    return client
  }

  if (!client.isFeatureSupported(Features.Sessions)) {
    new Error('[nuxt-surrealdb] Sessions are not supported by this SurrealDB Node engine.')
    return client
  }

  const session = await client[config.session === 'fork' ? 'forkSession' : 'newSession']()
  event.context.surrealdb = session

  await surrealHooks.callHookParallel('surrealdb:local:session:init', { session, event })

  return session
}

// #endregion public composable

declare module 'h3' {
  interface H3EventContext {
    [H3_CONTEXT_SURREAL_LOCAL]?: SurrealSession
  }
}
