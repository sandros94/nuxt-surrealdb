import { useFetch, useNuxtApp } from 'nuxt/app'
import { type MaybeRefOrGetter, ref } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'

import type {
  KeysOf,
  PickFrom,
  SurrealFetchOptions,
  RpcRequest,
  RpcResponse,
} from '../types'

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
  req: RpcRequest<T>,
  options?: Omit<SurrealFetchOptions<RpcResponse<T>>, 'method' | 'body'>,
): AsyncData<RpcResponse<T> | null, FetchError<any> | null> {
  const id = ref(0)

  return useSurrealFetch<RpcResponse<T>>('rpc', {
    ...options,
    method: 'POST',
    body: {
      id: id.value++,
      ...req,
    },
  })
}
