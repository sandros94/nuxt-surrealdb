// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { FetchOptions, ResponseType } from 'ofetch'
import { textToBase64 } from 'undio'
import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'
import { getCookie } from 'h3'
import { createDefu, defu } from 'defu'

import type {
  DatabasePreset,
  DatabasePresetKeys,
  DatabasePresetServerKeys,
  RpcRequest,
  ServerOverrides,
  SurrealFetchOptions,
} from '../../types/index'
import { createError, useRuntimeConfig } from '#imports'

type DPresets = Record<DatabasePresetKeys, DatabasePreset>
type DPresetsServer = Record<DatabasePresetServerKeys, DatabasePreset>

function authTokenFn(dbAuth: DatabasePreset['auth']) {
  if (!dbAuth) return undefined
  if (typeof dbAuth === 'string') {
    return `Bearer ${dbAuth}`
  }
  else {
    return `Basic ${textToBase64(`${dbAuth.user}:${dbAuth.pass}`, { dataURL: false })}`
  }
}

export function useSurrealDatabases(event?: H3Event): {
  [key in DatabasePresetServerKeys]: DatabasePreset
} {
  // TODO: properly type this
  const {
    surrealdb: {
      databases: privateDatabases,
      defaultDatabase: defaultPrivateDatabase,
    },
    public: {
      surrealdb: {
        databases: _publicDatabases,
        defaultDatabase: defaultPublicDatabase,
      },
    },
  } = useRuntimeConfig(event) as any
  const defaultPrivateDB = privateDatabases[defaultPrivateDatabase] as DPresets
  const defaultPublicDB = _publicDatabases[defaultPublicDatabase] as DPresetsServer

  const defuPublicDatabases = createDefu((obj, key, value) => {
    obj[key] = defu(value, obj[key], defaultPublicDB)
    return true
  })
  const publicDatabases = defuPublicDatabases(_publicDatabases, {
    [defaultPublicDatabase]: defaultPublicDB,
  })
  const defuDatabases = createDefu((obj, key, value) => {
    obj[key] = defu(value, obj[key], defaultPrivateDB)
    return true
  })

  const databases = defuDatabases(privateDatabases, publicDatabases) as DPresetsServer

  return databases
}

export function useSurrealFetch<
  T = any,
  R extends string = string,
>(
  event: H3Event,
  req: R,
  options: SurrealFetchOptions & ServerOverrides,
): Promise<T> {
  // TODO: properly type this
  const { surrealdb: { defaultDatabase }, public: { surrealdb: { auth: { cookieName } } } } = useRuntimeConfig(event) as any
  const defaultDB = useSurrealDatabases(event)[defaultDatabase as DatabasePresetServerKeys]
  const authToken = authTokenFn(defaultDB.auth)
  const userAuth = getCookie(event, cookieName)
  const { database, token, ...opts } = options

  const surrealFetch = ofetch.create({
    baseURL: defaultDB.host,
    onRequest({ options }) {
      options.headers = options.headers || {}

      // @ts-expect-error NS header type missing
      if (defaultDB.NS && options.headers['surreal-NS'] === undefined) {
        // @ts-expect-error NS header type missing
        options.headers['surreal-NS'] = defaultDB.NS
      }
      // @ts-expect-error DB header type missing
      if (defaultDB.DB && options.headers['surreal-DB'] === undefined) {
        // @ts-expect-error DB header type missing
        options.headers['surreal-DB'] = defaultDB.DB
      }
      // @ts-expect-error Authorization header type missing
      if (authToken && !userAuth && !options.headers.Authorization) {
        // @ts-expect-error Authorization header type missing
        options.headers.Authorization = authToken
      }
      // @ts-expect-error Authorization header type missing
      else if (userAuth && !options.headers.Authorization) {
        // @ts-expect-error Authorization header type missing
        options.headers.Authorization = `Bearer ${userAuth}`
      }
    },
  })

  return surrealFetch<T>(req, {
    ...opts,
    ...useSurrealFetchOptionsOverride(
      event,
      {
        database,
        token,
      },
      opts,
    ),
  })
}

export function useSurrealFetchOptionsOverride<
  R extends ResponseType = ResponseType,
>(
  event: H3Event,
  overrides: ServerOverrides = {},
  defaults?: Pick<FetchOptions<R>, 'headers'>,
) {
  // TODO: properly type this
  const {
    database,
    token,
  } = overrides
  const { surrealdb: { defaultDatabase }, public: { surrealdb: { auth: { cookieName } } } } = useRuntimeConfig(event) as any
  const databases = useSurrealDatabases(event)
  const authToken = authTokenFn(databases[defaultDatabase as DatabasePresetServerKeys].auth)
  const userAuth = getCookie(event, cookieName)

  const headers = defaults?.headers as Record<string, string> || {}
  let db: DatabasePreset = {}
  let baseURL: string | undefined = undefined
  let dbAuth = authToken

  if (database !== undefined) {
    if (typeof database !== 'string' && typeof database !== 'number' && typeof database !== 'symbol') {
      db = database
    }
    else {
      db = databases[database]
    }
    if (db.host) {
      baseURL = db.host
    }
    if (db.NS) {
      headers['surreal-NS'] = db.NS
    }
    if (db.DB) {
      headers['surreal-DB'] = db.DB
    }
    if (db.auth && token !== false) {
      dbAuth = authTokenFn(db.auth)
    }
  }

  if (token !== false) {
    if (token === true && dbAuth !== undefined) {
      headers.Authorization = dbAuth
    }
    else if (typeof token === 'string' || typeof token === 'object') {
      const _token = authTokenFn(token)
      if (_token !== undefined) {
        headers.Authorization = _token
      }
    }
    else {
      const _token = userAuth ? `Bearer ${userAuth}` : dbAuth
      if (_token !== undefined) {
        headers.Authorization = _token
      }
    }
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
    ...(baseURL !== undefined && { baseURL }),
  }
}

export function useSurrealRPC<T = any>(event: H3Event, req: RpcRequest<T>, ovr?: ServerOverrides) {
  let id = 0

  return useSurrealFetch<T>(event, 'rpc', {
    ...useSurrealFetchOptionsOverride(event, ovr),
    onResponse({ response }) {
      if (response.status === 200 && response._data.error) {
        throw createError({
          statusCode: response._data.error.code,
          message: response._data.error.message,
        })
      }
      else if (response.status === 200 && response._data.result) {
        response._data = response._data.result
      }
    },
    method: 'POST',
    body: {
      id: id++,
      ...req,
    },
  })
}
