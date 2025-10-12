import type { Surreal } from 'surrealdb'

import { onBeforeUnmount, useNuxtApp } from '#imports'

export async function useSurrealMem(): Promise<Surreal | null> {
  const {
    $surrealMem,
    hooks,
    $config: { public: { surrealdb: { memory } = {} } = {} },
  } = useNuxtApp()

  onBeforeUnmount(() => {
    if ($surrealMem !== null)
      $surrealMem.close().catch(() => {})
  })

  if ($surrealMem !== null) {
    // This is actually always true, because endpoint has a default value
    const isConnected = await $surrealMem.connect('mem://', memory?.connectOptions)
    if (isConnected)
      hooks.callHookParallel('surrealdb:memory:connected', $surrealMem, memory || {})
  }

  return $surrealMem
}
