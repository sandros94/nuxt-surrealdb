// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import { ofetch } from 'ofetch'

import type { DatabasePresetKeys, Overrides, RpcRequest } from '#surrealdb/types/index'
import {
  setRequestHeaders,
  surrealFetchOptionsOverride,
} from '#surrealdb/utils/overrides'
import {
  createError,
  defineNuxtPlugin,
  useSurrealAuth,
  useSurrealPreset,
} from '#imports'

export default defineNuxtPlugin(async ({ $config }) => {
  const authDatabase = $config.public.surrealdb.auth.database as DatabasePresetKeys | false
  const { token: userToken, session } = useSurrealAuth()
  const database = useSurrealPreset()
  const { baseURL, headers } = surrealFetchOptionsOverride(database)

  const surrealFetch = ofetch.create({
    onRequest(ctx) {
      ctx.options.baseURL ||= baseURL
      ctx.options.headers ||= setRequestHeaders(ctx.options.headers, headers)
    },
  })

  function surrealRPC<T = any>(req: RpcRequest<T>, overrides?: Overrides): Promise<T> {
    let id = 0

    return surrealFetch<T>('rpc', {
      ...surrealFetchOptionsOverride(useSurrealPreset(overrides)),
      onResponse({ response }) {
        if (response.status === 200 && response._data.error) {
          throw createError({
            statusCode: response._data.error.code,
            message: response._data.error.message,
          })
        }
        else if (response.status === 200) {
          response._data = response._data.result
        }
      },
      method: 'POST',
      body: {
        id: id++,
        ...req,
      },
    })
  }

  if (userToken.value && !session.value.user && authDatabase !== false) {
    const user = await surrealRPC({
      method: 'info',
    }, {
      database: authDatabase,
    })
    if (user) {
      session.value.user = user
    }
  }

  return {
    provide: {
      surrealFetch,
      surrealRPC,
    },
  }
})
