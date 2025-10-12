import type { Surreal } from 'surrealdb'

import { onBeforeUnmount, useNuxtApp } from '#imports'

export async function useSurrealLocal(): Promise<Surreal | null> {
  const {
    $surrealLocal,
    hooks,
    $config: { public: { surrealdb: { local } = {} } = {} },
  } = useNuxtApp()

  onBeforeUnmount(() => {
    if ($surrealLocal !== null)
      $surrealLocal.close().catch(() => {})
  })

  if ($surrealLocal !== null) {
    await hooks.callHookParallel('surrealdb:local:init', $surrealLocal, local || {})

    if (local?.endpoint && local?.autoConnect !== false) {
      // This is actually always true, because endpoint has a default value
      const isConnected = await $surrealLocal.connect(local.endpoint, local.connectOptions)
      if (isConnected)
        hooks.callHookParallel('surrealdb:local:connected', $surrealLocal, local)
    }
  }

  return $surrealLocal
}
