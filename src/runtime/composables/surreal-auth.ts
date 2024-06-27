import type { PublicRuntimeConfig } from 'nuxt/schema'
import { defu } from 'defu'

import type { Overrides, RpcRequest, SurrealFetchOptions, UserSession } from '../types'

import { computed, createError, ref, useCookie, useNuxtApp, useState } from '#imports'

export function useSurrealAuth() {
  const {
    $config: {
      public: {
        surrealdb: {
          databases,
          auth: {
            adminMaxAge,
            database,
            sessionName,
            cookieName,
            sameSite,
          },
        },
      },
    },
    $surrealFetch,
    $surrealFetchOptionsOverride,
  } = useNuxtApp()
  const authDatabase = database as keyof PublicRuntimeConfig['surrealdb']['databases']

  function _surrealRPC<T = any>(req: RpcRequest<T>, token: Overrides['token'] = false) {
    const id = ref(0)

    return $surrealFetch<T, string, SurrealFetchOptions>('rpc', {
      ...$surrealFetchOptionsOverride({
        database: authDatabase,
        token,
      }),
      onResponse({ response }) {
        if (response.status === 200 && response._data.error) {
          throw createError({
            statusCode: response._data.error.code,
            message: response._data.error.message,
          })
        }
      },
      method: 'POST',
      body: {
        id: id.value++,
        ...req,
      },
    })
  }

  const session = useState<UserSession>(sessionName, () => ({}))

  // TODO: Handle token maxAge update aftert a reAuthenticate
  const setToken = (unixTimestamp?: number) => useCookie(cookieName, {
    ...(unixTimestamp && { expires: (new Date(unixTimestamp * 1000)) }),
    sameSite: (sameSite as boolean | 'lax' | 'strict' | 'none'),
    secure: !import.meta.dev,
  })
  const token = setToken()

  // authenticate
  async function reAuthenticate() {
    if (!token.value) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await _surrealRPC({
      method: 'authenticate',
      params: [token.value],
    })
    await refreshInfo()
  }

  async function getSessionExp(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    return (await _surrealRPC<{ result: [{ result: [{ exp: number | 'NONE' | null }] }] }>({
      method: 'query',
      params: ['SELECT exp FROM $session;'],
    }, _token)).result[0].result[0]
  }

  // info
  async function refreshInfo(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    const { result } = await _surrealRPC<{ result: UserSession['user'] }>({
      method: 'info',
    }, _token)
    if (!result) return
    session.value.user = result
  }

  // invalidate
  async function invalidate(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await _surrealRPC({
      method: 'invalidate',
    }, _token).then(() => {
      token.value = null
      session.value = {}
    })
  }

  // signin
  async function signin(credentials: Record<string, any>) {
    const _credentials = defu(
      credentials,
      {
        NS: databases[authDatabase].NS,
        DB: databases[authDatabase].DB,
        SC: databases[authDatabase].SC,
      },
    )
    if (!_credentials.NS || !_credentials.DB || !_credentials.SC) throw createError({ statusCode: 500, message: 'Invalid database preset' })
    const { result } = await _surrealRPC<{ result: string }>({
      method: 'signin',
      params: [_credentials],
    })
    if (result) {
      await getSessionExp(`Bearer ${result}`).then(async ({ exp }) => {
        if (!exp) throw createError({ statusCode: 401, message: 'User is not authenticated' })
        else if (exp === 'NONE') {
          setToken(adminMaxAge).value = result
          await refreshInfo(`Bearer ${result}`)
        }
        else {
          setToken(exp).value = result
          await refreshInfo(`Bearer ${result}`)
        }
      })
    }
  }

  // signup
  async function signup(credentials: Record<string, any>) {
    const _credentials = defu(
      credentials,
      {
        NS: databases[authDatabase].NS,
        DB: databases[authDatabase].DB,
        SC: databases[authDatabase].SC,
      },
    )
    if (!_credentials.NS || !_credentials.DB || !_credentials.SC) throw createError({ statusCode: 500, message: 'Invalid database preset' })
    const { result } = await _surrealRPC<{ result: string }>({
      method: 'signup',
      params: [_credentials],
    })
    if (result) {
      await getSessionExp(`Bearer ${result}`).then(async ({ exp }) => {
        if (!exp) throw createError({ statusCode: 401, message: 'User is not authenticated' })
        else {
          // Signup users cannot be admins
          setToken(exp as number).value = result
          await refreshInfo(`Bearer ${result}`)
        }
      })
    }
  }

  return {
    getSessionExp,
    isAuthenticated: computed(() => Boolean(session.value.user)),
    invalidate,
    reAuthenticate,
    session,
    signin,
    signout: invalidate,
    signup,
    token,
    refreshInfo,
    user: computed(() => session.value.user || null),
  }
}
