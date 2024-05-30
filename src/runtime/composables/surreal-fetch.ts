import { useFetch, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { type MaybeRefOrGetter, ref } from 'vue'
import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { textToBase64 } from 'undio'

import type {
  DatabasePreset,
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
  const _token = ref<string | undefined>(token)

  function authToken(db: DatabasePreset): string | undefined {
    if (db.auth) {
      if (typeof db.auth === 'string') {
        if (db.auth.startsWith('Bearer ')) {
          return db.auth
        }
        else {
          const [user, pass] = db.auth.split(':')
          if (user && pass) {
            return `Basic ${textToBase64(`${user}:${pass}`, { dataURL: false })}`
          }
        }
      }
      else if (db.auth.user && db.auth.pass) {
        return `Basic ${textToBase64(`${db.auth.user}:${db.auth.pass}`, { dataURL: false })}`
      }
    }
  }

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
    if (db.value.auth && !token) {
      _token.value = authToken(db.value)
    }
  }
  if (_token.value) {
    headers.Authorization = _token.value
  }

  return useFetch(endpoint, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...opts.headers,
      ...headers,
    },
    $fetch: useNuxtApp().$surrealFetch,
  })
}

export function useSurrealRPC<T = any>(
  req: RpcRequest<T>,
  options: SurrealFetchOptions<RpcResponse<T>> = {},
) {
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
