import type { Surreal } from 'surrealdb'

import { useNuxtApp } from '#imports'

export function useSurrealLocal(): Surreal | null {
  const client = useNuxtApp().$surrealLocal as Surreal | null

  return client
}
