import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'

import type {
  KeysOf,
  PickFrom,
  UseSurrealFetchOptions,
  UseSurrealRpcOptions,
  RpcRequest,
  RpcResponseError,
} from '../types'
import type {
  ComputedRef,
  MaybeRefOrGetter,
} from '#imports'
import {
  createError,
  ref,
  toValue,
  useFetch,
  useNuxtApp,
} from '#imports'

export function useSurrealFetch<DataT = any, ErrorT = any>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseSurrealFetchOptions<DataT> = {},
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

export function useSurrealRPC<DataT = any>(
  req: {
    method: MaybeRefOrGetter<RpcRequest<DataT>['method']>
    params?: MaybeRefOrGetter<RpcRequest<DataT>['params']> | ComputedRef<RpcRequest<DataT>['params']>
  },
  options?: UseSurrealRpcOptions<DataT>,
): AsyncData<PickFrom<DataT, KeysOf<DataT>> | null, FetchError<any> | RpcResponseError | null> {
  const id = ref(0)
  const { key, ...opts } = options || {}

  const _key = key ?? 'Sur_' + hash(['surreal', 'rpc', toValue(req.method), toValue(req.params)])

  return useSurrealFetch<DataT, RpcResponseError>('rpc', {
    ...opts,
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
      id: id.value++,
      ...req,
    },
    key: _key,
  })
}
