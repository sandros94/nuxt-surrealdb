import type { Overrides } from '../types'
import { useSurrealFetch } from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  async function sql<T>(sql: string, ovr?: Overrides) {
    return useSurrealFetch<T>('sql', {
      ...(ovr || overrides),
      method: 'POST',
      body: sql,
    })
  }

  return {
    sql,
  }
}
