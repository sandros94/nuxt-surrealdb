import type { AsyncData, AsyncDataOptions, UseFetchOptions, NuxtError } from 'nuxt/app'
import { useAsyncData, useFetch, useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { type MaybeRefOrGetter, computed, ref } from 'vue'
import type { FetchError } from 'ofetch'
import { textToBase64 } from 'undio'
import { hash } from 'ohash'

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
  options: AsyncDataOptions<RpcResponse<T>> & Overrides & {
    key?: string
  } = {},
): AsyncData<RpcResponse<T> | null, NuxtError<unknown> | null> {
  const { $surrealRPC } = useNuxtApp()
  const {
    database,
    token,
    key,
    ...opts
  } = options
  const _key = computed(() => {
    return key ?? 'D_' + hash(['surrealItems', req.method, req.params?.toString() ?? ''])
  })

  return useAsyncData(_key.value, () => $surrealRPC<T>(req, { database, token }), opts)
}
