import type { ResolvedFetchOptions, ResponseType } from 'ofetch'
import { textToBase64 } from 'undio'
import { createDefu, defu } from 'defu'
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

export function surrealFetchOptionsOverride(
  databasePreset: DatabasePreset,
): {
    baseURL: ResolvedFetchOptions<ResponseType, any>['baseURL']
    headers: Record<string, string>
  } {
  const authorization = authTokenFn(databasePreset.auth)
  return {
    baseURL: databasePreset.host,
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
      'surreal-NS': databasePreset.NS as string,
      'surreal-DB': databasePreset.DB as string,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },

  }
}

export const defuDbs = createDefu((obj: any, key, value) => {
  if (value) {
    obj[key] = value
    return true
  }
  return true
})

export function setRequestHeaders(headers: Headers, append?: Record<string, string>): Headers {
  if (!append) return headers
  for (const [key, value] of Object.entries(append)) {
    headers.set(key, value)
  }
  return headers
}
