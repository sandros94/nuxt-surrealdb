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
  SurrealFetchOptions,
  SurrealRpcOptions,
  RpcRequest,
  RpcResponse,
} from '../types'
import type {
  ComputedRef,
  MaybeRefOrGetter,
} from '#imports'
import { ref, toValue } from '#imports'

export function useSurrealFetch<T = any>(
  endpoint: MaybeRefOrGetter<string>,
  options: SurrealFetchOptions<T> = {},
): AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | null> {
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
    params: MaybeRefOrGetter<RpcRequest<T>['params']> | ComputedRef<RpcRequest<T>['params']>
  },
  options?: SurrealRpcOptions<T>,
): AsyncData<RpcResponse<T> | null, FetchError<any> | null> {
  const id = ref(0)
  const { key, ...opts } = options || {}

  const _key = key ?? 'Sur_' + hash(['surreal', 'rpc', toValue(req.method), toValue(req.params)])

  return useSurrealFetch<RpcResponse<T>>('rpc', {
    ...opts,
    method: 'POST',
    body: {
      id: id.value++,
      method: toValue(req.method),
      params: toValue(req.params),
    },
    key: _key,
  })
}
