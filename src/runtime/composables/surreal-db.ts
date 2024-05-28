import type { Overrides, Response } from '../types'
import { useNuxtApp, useSurrealFetch } from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()

  async function sql<T>(sql: string, ovr?: Overrides) {
    return useSurrealFetch<T>('sql', {
      ...(ovr || overrides),
      method: 'POST',
      body: sql,
    })
  }

  async function $sql<T = unknown[]>(sql: string, ovr?: Overrides) {
    return $surrealFetch<Response<T>>('sql', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
      method: 'POST',
      body: sql,
    })
  }

  async function version(ovr?: Overrides) {
    return useSurrealFetch('version', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
    })
  }

  return {
    sql,
    $sql,
    version,
  }
}
