// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'

import type {
  RpcRequest,
  ServerOverrides,
  SurrealFetchOptions,
} from '#surrealdb/types/index'
import {
  setRequestHeaders,
  surrealFetchOptionsOverride,
} from '#surrealdb/utils/overrides'
import {
  createError,
  useSurrealPreset,
} from '#imports'

export function useSurrealFetch<
  T = any,
>(
  req: string,
  options?: SurrealFetchOptions & ServerOverrides,
): Promise<T>
export function useSurrealFetch<
  T = any,
>(
  event: H3Event,
  req: string,
  options?: SurrealFetchOptions & ServerOverrides,
): Promise<T>
export function useSurrealFetch<
  T = any,
>(...args: any[]): Promise<T> {
  if (typeof args[0] === 'string') {
    args.unshift(undefined)
  }

  // eslint-disable-next-line prefer-const
  let [event, req, options] = args as [H3Event | undefined, string, SurrealFetchOptions & ServerOverrides]

  const { database, token, ...opts } = options
  const _database = useSurrealPreset(event, { database, token })
  const { baseURL, headers } = surrealFetchOptionsOverride(_database)
  if (!baseURL) {
    createError({
      statusCode: 500,
      message: 'Missing SurrealDB URL',
    })
  }

  const surrealFetch = ofetch.create({
    baseURL,
    onRequest(ctx) {
      ctx.options.baseURL ||= baseURL
      ctx.options.headers ||= setRequestHeaders(ctx.options.headers, headers)
    },
  })

  return surrealFetch<T>(req, {
    ...opts,
  })
}

export function useSurrealRPC<
  T = any,
>(
  req: RpcRequest<T>,
  overrides?: ServerOverrides,
): Promise<T>
export function useSurrealRPC<
  T = any,
>(
  event: H3Event,
  req: RpcRequest<T>,
  overrides?: ServerOverrides,
): Promise<T>
export function useSurrealRPC<
  T = any,
>(...args: any[]): Promise<T> {
  if (!('node' in args[0]) && !('method' in args[1])) {
    args.unshift(undefined)
  }

  // eslint-disable-next-line prefer-const
  let [event, req, overrides] = args as [H3Event | undefined, RpcRequest<T>, ServerOverrides]
  let id = 0

  // eslint-disable-next-line prefer-const
  let _args = [event, 'rpc'] as [H3Event, string]

  if (typeof _args[0] === 'undefined') {
    _args.shift()
  }

  return useSurrealFetch<T>(..._args, {
    ...surrealFetchOptionsOverride(useSurrealPreset(event, overrides)),
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
