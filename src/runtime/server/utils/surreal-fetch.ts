// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { PublicRuntimeConfig, RuntimeConfig } from 'nuxt/schema'
import type { FetchOptions, ResponseType } from 'ofetch'
import { textToBase64 } from 'undio'
import type { H3Event } from 'h3'
import { ofetch } from 'ofetch'
import { getCookie } from 'h3'
import { defu } from 'defu'

import type {
  DatabasePreset,
  DatabasePresetServerKeys,
  RpcRequest,
  ServerOverrides,
  SurrealFetchOptions,
} from '../../types'
import { createError, useRuntimeConfig } from '#imports'

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
  const {
    surrealdb: {
      databases: privateDatabases,
    },
    public: {
      surrealdb: {
        databases: publicDatabases,
      },
    },
  } = useRuntimeConfig(event)

  const databases = defu<
    RuntimeConfig['surrealdb']['databases'],
    PublicRuntimeConfig['surrealdb']['databases'][]
  >(privateDatabases, publicDatabases)

  return {
    ...databases,
  }
}

export function useSurrealFetch<
  T = any,
  R extends string = string,
>(
  event: H3Event,
  req: R,
  options: SurrealFetchOptions,
): Promise<T> {
  const { surrealdb: { defaultDatabase }, public: { surrealdb: { auth: { cookieName } } } } = useRuntimeConfig(event)
  const defaultDB = useSurrealDatabases(event)[defaultDatabase as DatabasePresetServerKeys]
  const authToken = authTokenFn(defaultDB.auth)
  const userAuth = getCookie(event, cookieName)

  const surrealFetch = ofetch.create({
    baseURL: defaultDB.host,
    onRequest({ options }) {
      options.headers = options.headers || {}

      // @ts-expect-error KV header type missing
      if (defaultDB.KV && options.headers['surreal-KV'] === undefined) {
        // @ts-expect-error KV header type missing
        options.headers['surreal-KV'] = defaultDB.KV
      }
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

  return surrealFetch<T>(req, options)
}

export function useSurrealFetchOptionsOverride<
  R extends ResponseType = ResponseType,
>(
  event: H3Event,
  overrides: ServerOverrides = {},
  defaults?: Pick<FetchOptions<R>, 'headers'>,
) {
  const {
    database,
    token,
  } = overrides
  const { surrealdb: { defaultDatabase }, public: { surrealdb: { auth: { cookieName } } } } = useRuntimeConfig(event)
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
    if (db.KV) {
      headers['surreal-KV'] = db.KV
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
      _token !== undefined && (headers.Authorization = _token)
    }
    else {
      const _token = userAuth ? `Bearer ${userAuth}` : dbAuth
      _token !== undefined && (headers.Authorization = _token)
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
