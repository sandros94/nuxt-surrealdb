import type {
  DatabasePreset,
  DatabasePresetKeys,
  Overrides,
} from '#surrealdb/types/index'
import {
  defuDbs,
  getDatabasePreset,
} from '#surrealdb/utils/overrides'
import {
  useRuntimeConfig,
  useSurrealAuth,
} from '#imports'

type DatabasePresets = {
  [key in DatabasePresetKeys]: DatabasePreset
}

export function useSurrealDatabases(): DatabasePresets
export function useSurrealDatabases(databasePreset: DatabasePresetKeys): DatabasePreset
export function useSurrealDatabases(databasePreset?: DatabasePresetKeys): DatabasePreset | DatabasePresets {
  const { databases } = useRuntimeConfig().public.surrealdb

  const dbs = databases
  for (const _db in databases) {
    const db = _db as DatabasePresetKeys
    dbs[db] = defuDbs(
      databases[db],
      databases.default,
    )
  }

  if (!databasePreset) return dbs
  return dbs[databasePreset]
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
