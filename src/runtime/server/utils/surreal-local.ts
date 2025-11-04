import { type SurrealSession, Surreal, Features } from 'surrealdb'
import { createNodeEngines } from '@surrealdb/node'
import type { H3Event } from 'h3'

import { useNitroApp, useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

import {
  H3_CONTEXT_SURREAL_LOCAL,
} from '#surrealdb/internal'

// #region public composable

let client: Surreal | null = null
export async function useSurrealLocal(event?: undefined): Promise<Surreal>
export async function useSurrealLocal(event: H3Event): Promise<SurrealSession>
export async function useSurrealLocal(event?: H3Event | undefined): Promise<Surreal | SurrealSession> {
  if (event && event.context[H3_CONTEXT_SURREAL_LOCAL] && event.context[H3_CONTEXT_SURREAL_LOCAL].isValid) {
    return event.context[H3_CONTEXT_SURREAL_LOCAL]
  }

  const { hooks } = useNitroApp()
  const { surrealdb } = useRuntimeConfig(event)
  const { local } = surrealdb || {}
  const { nodeEngine, ...config } = local || {}

  async function getClient() {
    if (!client) {
      client = new Surreal({
        engines: createNodeEngines(nodeEngine),
      })
    }
    return client
  }

  const _client = await getClient()

  if (!_client.isConnected) {
    await surrealHooks.callHookParallel('surrealdb:init', { client: _client })

    if (config.endpoint && config.autoConnect !== false) {
      const isConnected = await _client.connect(config.endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:local:connected', { client: _client })
      }
    }
  }

  if (!event) {
    return _client
  }

  if (!_client.isFeatureSupported(Features.Sessions)) {
    // TODO: throw error once a stable v2 is released
    console.warn('[nuxt-surrealdb] Sessions are not supported by this SurrealDB Node engine.')
    return _client
  }

  const session = await _client[config.session === 'fork' ? 'forkSession' : 'newSession']()
  event.context.surrealdb = session

  await surrealHooks.callHookParallel('surrealdb:local:session:init', { client: session, event })

  hooks.hook('afterResponse', async (event) => {
    if (event.context[H3_CONTEXT_SURREAL_LOCAL]) {
      await event.context[H3_CONTEXT_SURREAL_LOCAL].closeSession()
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete event.context[H3_CONTEXT_SURREAL_LOCAL]
    }
  })

  return session
}

// #endregion public composable

declare module 'h3' {
  interface H3EventContext {
    [H3_CONTEXT_SURREAL_LOCAL]?: SurrealSession
  }
}
