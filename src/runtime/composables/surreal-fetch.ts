import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'
import {
  useFetch,
  useNuxtApp,
} from 'nuxt/app'

import type {
  KeysOf,
  PickFrom,
  SurrealUseFetchOptions,
  SurrealRpcOptions,
  RpcRequest,
  RpcResponseOk,
  RpcResponseError,
} from '../types'
import type {
  ComputedRef,
  MaybeRefOrGetter,
} from '#imports'
import { createError, ref, toValue } from '#imports'

export function useSurrealFetch<DataT = any, ErrorT = any>(
  endpoint: MaybeRefOrGetter<string>,
  options: SurrealUseFetchOptions<DataT> = {},
): AsyncData<PickFrom<DataT, KeysOf<DataT>> | null, ErrorT | FetchError<any> | null> {
  const {
    database,
    token,
    ...opts
  } = options
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()

  const { baseURL, headers } = $surrealFetchOptionsOverride({ database, token })

  return useFetch(endpoint, {
    ...opts,
    ...(baseURL !== undefined && { baseURL }),
    headers: {
      ...opts.headers,
      ...headers,
    },
    $fetch: $surrealFetch,
  })
}

export function useSurrealRPC<T = any>(
  req: {
    method: MaybeRefOrGetter<RpcRequest<T>['method']>
    params?: MaybeRefOrGetter<RpcRequest<T>['params']> | ComputedRef<RpcRequest<T>['params']>
  },
  options?: SurrealRpcOptions<T>,
): AsyncData<RpcResponseOk<T> | null, RpcResponseError | FetchError<any> | null> {
  const id = ref(0)
  const { key, ...opts } = options || {}

  const _key = key ?? 'Sur_' + hash(['surreal', 'rpc', toValue(req.method), toValue(req.params)])

  return useSurrealFetch<RpcResponseOk<T>, RpcResponseError>('rpc', {
    ...opts,
    onResponse({ response }) {
      if (response.status === 200 && response._data.error) {
        throw createError({
          statusCode: response._data.error.code,
          message: response._data.error.message,
        })
      }
    },
    method: 'POST',
    body: {
      id: id.value++,
      ...req,
    },
    key: _key,
  })
}
