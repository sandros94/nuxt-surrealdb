import type { H3Event } from 'h3'
import { getCookie } from 'h3'

import type {
  DatabasePreset,
  DatabasePresetKeys,
  DatabasePresetServerKeys,
  ServerOverrides,
} from '../../types'
import {
  defuDbs,
  getDatabasePreset,
} from '#surrealdb/utils/overrides'
import {
  useRuntimeConfig,
} from '#imports'

type DatabasePresets = {
  [key in DatabasePresetServerKeys]: DatabasePreset
}

let dbs: DatabasePresets | undefined
export function useSurrealDatabases(event?: H3Event): DatabasePresets
export function useSurrealDatabases(event?: H3Event, databasePreset?: DatabasePresetServerKeys): DatabasePreset
export function useSurrealDatabases(event?: H3Event, databasePreset?: DatabasePresetServerKeys): DatabasePreset | DatabasePresets {
  if (dbs) {
    if (!databasePreset) return dbs
    return dbs[databasePreset]
  }
  dbs = {
    default: {},
  }

  const {
    surrealdb: { databases: serverDbs },
    public: { surrealdb: { databases } },
  } = useRuntimeConfig(event)

  for (const _db in { ...databases, ...serverDbs }) {
    const db = _db as DatabasePresetServerKeys
    console.log(`Database \`${db}\`\nPublic:`, JSON.stringify(databases[db], null, 2), '\nServer:', JSON.stringify(serverDbs[db], null, 2), '\ncomputed', JSON.stringify(dbs[db], null, 2), '\n\n')
    dbs[db] = defuDbs(
      serverDbs[db],
      databases[db],
      serverDbs.default,
      databases.default,
    )
  }

  if (!databasePreset) return dbs
  return dbs[databasePreset]
}

export function useSurrealPreset(event: H3Event, overrides?: ServerOverrides): DatabasePreset {
  const { auth } = useRuntimeConfig(event).public.surrealdb

  return getDatabasePreset({
    authDatabase: auth.database as DatabasePresetKeys | false,
    databases: useSurrealDatabases(event),
    overrides,
    userToken: getCookie(event, auth.cookieName),
  })
}
