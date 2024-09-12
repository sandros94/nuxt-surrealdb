// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'
import { defu } from 'defu'

import type {
  RpcRequest,
  ServerOverrides,
  SurrealFetchOptions,
} from '#surrealdb/types/index'
import { surrealFetchOptionsOverride } from '#surrealdb/utils/overrides'
import {
  createError,
  useSurrealPreset,
} from '#imports'

export function useSurrealFetch<
  T = any,
  R extends string = string,
>(
  event: H3Event,
  req: R,
  options: SurrealFetchOptions & ServerOverrides,
): Promise<T> {
  const { database, token, ...opts } = options
  const _database = useSurrealPreset(event, { database, token })
  const { baseURL, headers } = surrealFetchOptionsOverride(_database)

  const surrealFetch = ofetch.create({
    baseURL,
    onRequest({ options }) {
      options.headers = defu<HeadersInit, HeadersInit[]>(options.headers, { ...headers })
    },
  })

  return surrealFetch<T>(req, {
    ...opts,
  })
}

export function useSurrealRPC<T = any>(event: H3Event, req: RpcRequest<T>, overrides?: ServerOverrides) {
  let id = 0

  return useSurrealFetch<T>(event, 'rpc', {
    ...overrides,
    onResponse({ response }) {
      if (response.status === 200 && response._data.error) {
        throw createError({
          statusCode: response._data.error.code,
          message: response._data.error.message,
        })
      }
      else if (response.status === 200 && response._data.result) {
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
