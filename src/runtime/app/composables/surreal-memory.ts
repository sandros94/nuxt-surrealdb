import type { Surreal } from 'surrealdb'

import { useNuxtApp } from '#imports'

export function useSurrealMem(): Surreal | null {
  const client = useNuxtApp().$surrealMem as Surreal | null

  return client
}
