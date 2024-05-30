// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { FetchOptions, ResponseType } from 'ofetch'
import { textToBase64 } from 'undio'

import type { DatabasePreset, Overrides } from './types'
import { defineNuxtPlugin, useCookie } from '#app'

export default defineNuxtPlugin(({ $config }) => {
  const { databases, tokenCookieName } = $config.public.surrealdb
  const userAuth = useCookie(tokenCookieName)

  let authToken: string | undefined = undefined

  if (databases.default.auth) {
    if (typeof databases.default.auth === 'string') {
      if (databases.default.auth.startsWith('Bearer ')) {
        authToken = databases.default.auth
      }
      else {
        const [user, pass] = databases.default.auth.split(':')
        if (user && pass) {
          authToken = `Basic ${textToBase64(`${user}:${pass}`, { dataURL: false })}`
        }
      }
    }
    else if (databases.default.auth.user && databases.default.auth.pass) {
      authToken = `Basic ${textToBase64(`${databases.default.auth.user}:${databases.default.auth.pass}`, { dataURL: false })}`
    }
  }

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
      if (authToken && !userAuth.value && !options.headers.Authorization) {
        // @ts-expect-error Authorization header type missing
        options.headers.Authorization = authToken
      }
      // @ts-expect-error Authorization header type missing
      else if (userAuth.value && !options.headers.Authorization) {
        // @ts-expect-error Authorization header type missing
        options.headers.Authorization = `Bearer ${userAuth.value}`
      }
    },
  })

  function surrealFetchOptionsOverride<
    R extends ResponseType = ResponseType,
  >(
    overrides: Overrides & (Pick<FetchOptions<R>, 'baseURL' | 'headers'>) = {},
  ) {
    const {
      database,
      token,
      headers: _headers,
      baseURL: _baseURL,
    } = overrides

    let db: DatabasePreset | undefined = undefined
    const headers: Record<string, string> = {}
    let baseURL = undefined

    if (database !== undefined) {
      if (typeof database !== 'string' && typeof database !== 'number' && typeof database !== 'symbol') {
        db = database
      }
      else {
        db = databases[database]
      }
      if (db.host && !_baseURL) {
        baseURL = db.host
      }
      if (db.NS) {
        headers.NS = db.NS
      }
      if (db.DB) {
        headers.DB = db.DB
      }
    }
    if (token) {
      headers.Authorization = token
    }

    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ..._headers,
        ...headers,
      },
      ...(baseURL !== undefined && { baseURL }),
    }
  }

  return {
    provide: {
      surrealFetch,
      surrealFetchOptionsOverride,
    },
  }
})
