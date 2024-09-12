import type {
  DatabasePreset,
  DatabasePresetKeys,
  Overrides,
} from '#surrealdb/types/index'
import {
  getDatabasePreset,
} from '#surrealdb/utils/overrides'
import {
  useRuntimeConfig,
  useSurrealAuth,
} from '#imports'

export function useSurrealDatabases(): {
  [key in DatabasePresetKeys]: DatabasePreset
}
export function useSurrealDatabases(databasePreset: DatabasePresetKeys): DatabasePreset
export function useSurrealDatabases(databasePreset?: DatabasePresetKeys): DatabasePreset | {
  [key in DatabasePresetKeys]: DatabasePreset
} {
  const { databases } = useRuntimeConfig().public.surrealdb

  if (!databasePreset) return databases
  return databases[databasePreset]
}

export function useSurrealPreset(overrides?: Overrides): DatabasePreset {
  const { surrealdb } = useRuntimeConfig().public

  return getDatabasePreset({
    authDatabase: surrealdb.auth.database as DatabasePresetKeys | false,
    databases: useSurrealDatabases(),
    overrides,
    userToken: useSurrealAuth().token.value,
  })
}
