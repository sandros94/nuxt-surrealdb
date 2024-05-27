import type { UseFetchOptions } from 'nuxt/app'
import { useFetch, useNuxtApp } from '#app'

export function useSurrealFetch<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {},
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$surrealFetch,
  })
}
