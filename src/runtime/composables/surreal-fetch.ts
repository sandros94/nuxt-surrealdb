import { useFetch, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import type { AsyncData, UseFetchOptions } from 'nuxt/app'
import { type MaybeRefOrGetter, ref } from 'vue'
import type { FetchError } from 'ofetch'

import type {
  DatabasePreset,
  KeysOf,
  Overrides,
  PickFrom,
  RpcRequest,
  RpcResponse,
} from '../types'

export function useSurrealFetch<T = any>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseFetchOptions<T> & Overrides = {},
): AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | null> {
  const {
    database,
    token,
    ...opts
  } = options

  const headers: Record<string, string> = {}
  if (database !== undefined) {
    const db = ref<DatabasePreset>()
    if (typeof database !== 'string' && typeof database !== 'number' && typeof database !== 'symbol') {
      db.value = database
    }
    else {
      const { databases } = useRuntimeConfig().public.surrealdb
      db.value = databases[database]
    }
    if (db.value.host && !opts.baseURL) {
      opts.baseURL = db.value.host
    }
    if (db.value.NS) {
      headers.NS = db.value.NS
    }
    if (db.value.DB) {
      headers.DB = db.value.DB
    }
  }
  if (token) {
    headers.Authorization = token
  }

  return useFetch(endpoint, {
    ...opts,
    headers: {
      Accept: 'application/json',
      ...opts.headers,
      ...headers,
    },
    $fetch: useNuxtApp().$surrealFetch,
  })
}

export function useSurrealRPC<T = any>(req: RpcRequest<T>, ovr?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()
  const id = ref<number>(0)

  return $surrealFetch<RpcResponse<T>>('rpc', {
    ...$surrealFetchOptionsOverride(ovr),
    method: 'POST',
    body: {
      id: id.value++,
      ...req,
    },
  })
}
