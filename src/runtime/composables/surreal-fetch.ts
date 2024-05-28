import type { UseFetchOptions } from 'nuxt/app'
import { type MaybeRefOrGetter, ref } from 'vue'

import type { DatabasePreset, Overrides } from '../types'
import { useFetch, useNuxtApp, useRuntimeConfig } from '#app'

export function useSurrealFetch<T = any>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseFetchOptions<T> & Overrides = {},
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
