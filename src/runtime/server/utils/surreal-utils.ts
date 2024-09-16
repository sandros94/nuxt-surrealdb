import type { H3Event } from 'h3'
import { getCookie } from 'h3'

import type {
  DatabasePreset,
  DatabasePresetKeys,
  DatabasePresetServerKeys,
  ServerOverrides,
} from '../../types'
import {
  getDatabasePreset,
} from '#surrealdb/utils/overrides'
import {
  useRuntimeConfig,
} from '#imports'

export function useSurrealDatabases(event?: H3Event): {
  [key in DatabasePresetServerKeys]: DatabasePreset
}
export function useSurrealDatabases(event?: H3Event, databasePreset?: DatabasePresetServerKeys): DatabasePreset
export function useSurrealDatabases(event?: H3Event, databasePreset?: DatabasePresetServerKeys): DatabasePreset | {
  [key in DatabasePresetServerKeys]: DatabasePreset
} {
  const { databases } = useRuntimeConfig(event).surrealdb

  if (!databasePreset) return databases
  return databases[databasePreset]
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
