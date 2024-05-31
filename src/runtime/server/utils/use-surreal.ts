// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { FetchOptions, ResponseType } from 'ofetch'
import { textToBase64 } from 'undio'
import type { H3Event } from 'h3'
import { getCookie } from 'h3'

import type { DatabasePreset, Overrides, RpcRequest, RpcResponse, SurrealFetchOptions } from '../../types'
import { useRuntimeConfig } from '#imports'

function authTokenFn(dbAuth: DatabasePreset['auth']) {
  if (!dbAuth) return undefined
  if (typeof dbAuth === 'string') {
    if (dbAuth.startsWith('Bearer ')) {
      return dbAuth
    }
    else {
      const [user, pass] = dbAuth.split(':')
      if (user && pass) {
        return `Basic ${textToBase64(`${user}:${pass}`, { dataURL: false })}`
      }
    }
  }
  else {
    return `Basic ${textToBase64(`${dbAuth.user}:${dbAuth.pass}`, { dataURL: false })}`
  }
}

export function surrealFetch<
  T = any,
  R extends string = string,
>(
  event: H3Event,
  req: R,
  options: SurrealFetchOptions,
) {
  const { databases, tokenCookieName } = useRuntimeConfig(event).public.surrealdb
  const authToken = authTokenFn(databases.default.auth)
  const userAuth = getCookie(event, tokenCookieName)

  const surrealFetch = $fetch.create({
    baseURL: databases.default.host,
    onRequest({ options }) {
      options.headers = options.headers || {}

      // @ts-expect-error NS header type missing
      if (databases.default.NS && options.headers.NS === undefined) {
        // @ts-expect-error NS header type missing
        options.headers.NS = databases.default.NS
      }
      // @ts-expect-error DB header type missing
      if (databases.default.DB && options.headers.DB === undefined) {
        // @ts-expect-error DB header type missing
        options.headers.DB = databases.default.DB
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

export function surrealFetchOptionsOverride<
  R extends ResponseType = ResponseType,
>(
  event: H3Event,
  overrides: Overrides = {},
  defaults?: Pick<FetchOptions<R>, 'headers'>,
) {
  const {
    database,
    token,
  } = overrides
  const { databases, tokenCookieName } = useRuntimeConfig(event).public.surrealdb
  const authToken = authTokenFn(databases.default.auth)
  const userAuth = getCookie(event, tokenCookieName)

  const headers = defaults?.headers as Record<string, string> || {}
  let db: DatabasePreset | undefined = undefined
  let baseURL: string | undefined = undefined
  let dbAuth: string | undefined = undefined

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
      headers.NS = db.NS
    }
    if (db.DB) {
      headers.DB = db.DB
    }
    if (db.auth) {
      dbAuth = authTokenFn(db.auth)
    }
  }

  if (token !== false) {
    const _token = authTokenFn(token)
    if (_token || userAuth || dbAuth || authToken) {
      headers.Authorization
        = _token
        ?? userAuth
          ? `Bearer ${userAuth}`
          : dbAuth
          ?? authToken as string
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

export function surrealRPC<T = any>(event: H3Event, req: RpcRequest<T>, ovr?: Overrides) {
  let id = 0

  return surrealFetch<RpcResponse<T>>(event, 'rpc', {
    ...surrealFetchOptionsOverride(event, ovr),
    method: 'POST',
    body: {
      id: id++,
      ...req,
    },
  })
}
