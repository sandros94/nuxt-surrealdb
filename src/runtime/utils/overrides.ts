import { textToBase64 } from 'undio'
import { defu } from 'defu'
import type {
  AuthToken,
  DatabasePreset,
  DatabasePresetKeys,
  DatabasePresetServerKeys,
  Overrides,
  ServerOverrides,
} from '#surrealdb/types/index'

export function authTokenFn(authToken?: AuthToken) {
  if (!authToken) return undefined
  if (typeof authToken === 'string') {
    return `Bearer ${authToken}`
  }
  else {
    return `Basic ${textToBase64(`${authToken.user}:${authToken.pass}`, { dataURL: false })}`
  }
}

interface GetDatabasePresetOptions {
  authDatabase: DatabasePresetKeys | false
  databases: {
    [key in DatabasePresetKeys]: DatabasePreset
  }
  overrides?: Overrides
  userToken?: string | null
}

interface GetDatabasePresetServerOptions {
  authDatabase: DatabasePresetKeys | false
  databases: {
    [key in DatabasePresetServerKeys]: DatabasePreset
  }
  overrides?: ServerOverrides
  userToken?: string
}

export function getDatabasePreset(options: GetDatabasePresetOptions | GetDatabasePresetServerOptions): DatabasePreset {
  const {
    authDatabase,
    databases,
    overrides,
    userToken,
  } = options

  const getAuthToken = (
    basePreset: DatabasePreset,
    overrideToken?: Overrides['token'] | null,
  ): AuthToken | undefined => {
    if (typeof overrideToken === 'boolean') {
      return overrideToken ? basePreset.auth : undefined
    }
    return overrideToken || basePreset.auth
  }

  const getPresetWithAuth = (
    preset: DatabasePreset,
    token: Overrides['token'] | null,
  ): DatabasePreset => ({
    ...preset,
    auth: getAuthToken(preset, token),
  })

  // Early return for no overrides case
  if (!overrides) {
    return authDatabase === 'default'
      ? getPresetWithAuth(databases['default'], userToken)
      : databases['default']
  }

  const { database, token } = overrides

  // Handle database preset key case
  if (typeof database === 'string' || typeof database === 'number' || typeof database === 'symbol') {
    const preset = databases[database]
    const authToken = authDatabase === database ? (token ?? userToken) : token
    return getPresetWithAuth(preset, authToken)
  }

  // Handle database preset object case
  const basePreset = defu<DatabasePreset, DatabasePreset[]>(database, databases['default'])
  return getPresetWithAuth(basePreset, token)
}

export function surrealFetchOptionsOverride<
  T = HeadersInit,
>(
  databasePreset: DatabasePreset,
  headers?: T,
): {
    baseURL: string
    headers: T
  } {
  const authorization = authTokenFn(databasePreset.auth)
  const _headers = defu(
    {
      'surreal-NS': databasePreset.NS,
      'surreal-DB': databasePreset.DB,
      'surreal-SC': databasePreset.SC,
      'surreal-AC': databasePreset.AC,
      'Authorization': authorization,
    },
    // @ts-expect-error using a generic
    headers,
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  )
  return {
    baseURL: databasePreset.host,
    headers: _headers as T,
  }
}
