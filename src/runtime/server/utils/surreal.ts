import { type SurrealSession, Surreal, Features, createRemoteEngines } from 'surrealdb'
import type { H3Event } from 'h3'
import { defu } from 'defu'

import { useNitroApp, useRuntimeConfig } from '#imports'

import { surrealHooks } from './surreal-hooks'

import {
  H3_CONTEXT_SURREAL_CLIENT,
} from '#surrealdb/internal'

// #region public composable

let client: Surreal | null = null
export async function useSurreal(event?: undefined): Promise<Surreal>
export async function useSurreal(event: H3Event): Promise<SurrealSession>
export async function useSurreal(event?: H3Event | undefined): Promise<Surreal | SurrealSession> {
  if (event && event.context[H3_CONTEXT_SURREAL_CLIENT] && event.context[H3_CONTEXT_SURREAL_CLIENT].isValid) {
    return event.context[H3_CONTEXT_SURREAL_CLIENT]
  }

  const { hooks } = useNitroApp()
  const {
    public: { surrealdb: {
      local: _pubLocal,
      memory: _pubMemory,
      ...pubSurrealdb
    } = {} },
    surrealdb: {
      local: _srvLocal,
      memory: _srvMemory,
      ...srvSurrealdb
    } = {},
  } = useRuntimeConfig(event)

  if (!client) {
    client = new Surreal({
      engines: createRemoteEngines(),
    })
  }

  if (!client.isConnected) {
    const config = defu(srvSurrealdb, pubSurrealdb)
    await surrealHooks.callHookParallel('surrealdb:connecting', { client, config })

    if (config.endpoint && config.autoConnect !== false) {
      let endpoint = config.endpoint

      // prefer http
      if (config.preferHttp !== false) {
        endpoint = endpoint.replace(/^ws/, 'http')
      }

      const isConnected = await client.connect(endpoint, config.connectOptions)
      if (isConnected) {
        await surrealHooks.callHookParallel('surrealdb:connected', { client })
      }
    }
  }

  if (!event) {
    return client
  }

  if (!client.isFeatureSupported(Features.Sessions)) {
    // TODO: throw error once a stable v2 is released
    console.warn('[nuxt-surrealdb] Sessions are not supported by the connected SurrealDB instance.')
    return client
  }

  const session = await client[srvSurrealdb.session === 'fork' ? 'forkSession' : 'newSession']()
  event.context.surrealdb = session

  await surrealHooks.callHookParallel('surrealdb:session:init', { session, event })

  hooks.hook('afterResponse', async (event) => {
    if (event.context[H3_CONTEXT_SURREAL_CLIENT]) {
      await event.context[H3_CONTEXT_SURREAL_CLIENT].closeSession()
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete event.context[H3_CONTEXT_SURREAL_CLIENT]
    }
  })

  return session
}

// #endregion public composable

declare module 'h3' {
  interface H3EventContext {
    [H3_CONTEXT_SURREAL_CLIENT]?: SurrealSession
  }
}
