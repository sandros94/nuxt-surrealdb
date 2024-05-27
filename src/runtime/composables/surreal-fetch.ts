import type { UseFetchOptions } from 'nuxt/app'

import type { Overrides } from '../types'
import { useFetch, useNuxtApp } from '#app'

export function useSurrealFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> & Overrides = {},
) {
  const {
    NS,
    DB,
    token,
    ...opts
  } = options

  const headers: Record<string, string> = {}
  if (NS) {
    headers.NS = NS
  }
  if (DB) {
    headers.DB = DB
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  opts.headers = Object.keys(headers).length
    ? {
        ...opts.headers,
        ...headers,
      }
    : undefined

  return useFetch(url, {
    ...opts,
    $fetch: useNuxtApp().$surrealFetch,
  })
}
