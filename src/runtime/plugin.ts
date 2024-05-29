// The following nitropack import is from https://github.com/nuxt/module-builder/issues/141#issuecomment-2078248248
import type {} from 'nitropack'
import type { FetchOptions, ResponseType } from 'ofetch'

import type { DatabasePreset, Overrides } from './types'
import { defineNuxtPlugin, useCookie } from '#app'

export default defineNuxtPlugin(({ $config }) => {
  const { databases, tokenCookieName } = $config.public.surrealdb
  const userAuth = useCookie(tokenCookieName)

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
      if (userAuth.value && !options.headers.Authorization) {
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
        Accept: 'application/json',
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
