import type { UseFetchOptions } from 'nuxt/app'
import { type MaybeRefOrGetter, ref } from 'vue'

import type { DatabasePreset, Overrides, Response } from '../types'
import { useFetch, useLazyFetch, useNuxtApp, useRuntimeConfig } from '#app'

export function useSurrealFetch<T>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseFetchOptions<Response<T>> & Overrides = {},
) {
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
  opts.headers = Object.keys(headers).length
    ? {
        ...opts.headers,
        ...headers,
      }
    : undefined

  return useFetch(endpoint, {
    ...opts,
    $fetch: useNuxtApp().$surrealFetch,
  })
}

export function useSurrealLazyFetch<T>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseFetchOptions<Response<T>> & Overrides = {},
) {
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
  opts.headers = Object.keys(headers).length
    ? {
        ...opts.headers,
        ...headers,
      }
    : undefined

  return useLazyFetch(endpoint, {
    ...opts,
    $fetch: useNuxtApp().$surrealFetch,
  })
}
