import type { PublicRuntimeConfig } from 'nuxt/schema'
import { defu } from 'defu'

import type { RpcParams } from '../types'

import type { UserSession } from '#surreal-auth'
import { computed, createError, useCookie, useRuntimeConfig, useState, useSurrealDB } from '#imports'

export function useSurrealAuth() {
  const {
    databases,
    auth: {
      adminMaxAge,
      database,
      sessionName,
      cookieName,
      sameSite,
    },
  } = useRuntimeConfig().public.surrealdb
  const authDatabase = database as keyof PublicRuntimeConfig['surrealdb']['databases']
  const { $authenticate, $info, $invalidate, $signin, $signup, $sql } = useSurrealDB({ database: authDatabase })

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
    await $authenticate(token.value)
    await refreshInfo()
  }

  async function getSessionExp(authToken?: string) {
    const _token = authToken || token.value
    return await $sql('SELECT exp FROM $session;', { database: authDatabase, token: `Bearer ${_token}` })
  }

  // info
  async function refreshInfo(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    const { result } = await $info<UserSession['user']>({
      database: authDatabase,
      token: `Bearer ${_token}`,
    })
    if (!result) return
    session.value.user = result
  }

  // invalidate
  async function invalidate(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await $invalidate({
      database: authDatabase,
      token: `Bearer ${_token}`,
    })
    token.value = null
    session.value = {}
  }

  // signin
  async function signin(credentials: RpcParams<any, 'signin'>[0]) {
    const _credentials = defu(
      credentials,
      {
        NS: databases[authDatabase].NS,
        DB: databases[authDatabase].DB,
        SC: databases[authDatabase].SC,
      },
    )
    if (!_credentials.NS || !_credentials.DB || !_credentials.SC) throw createError({ statusCode: 500, message: 'Invalid database preset' })
    const { result } = await $signin<string>({
      ..._credentials,
    }, { database: authDatabase, token: false })
    if (result) {
      await getSessionExp(result).then(async ({ result: query }) => {
        if (typeof query[0].result[0].exp === 'number') {
          setToken(query[0].result[0].exp).value = result
          await refreshInfo(result)
        }
        else {
          // Assume a system user logged in
          setToken(adminMaxAge).value = result
          await refreshInfo(result)
        }
      })
    }
  }

  // signup
  async function signup(credentials: RpcParams<any, 'signup'>[0]) {
    const _credentials = defu(
      credentials,
      {
        NS: databases[authDatabase].NS,
        DB: databases[authDatabase].DB,
        SC: databases[authDatabase].SC,
      },
    )
    if (!_credentials.NS || !_credentials.DB || !_credentials.SC) throw createError({ statusCode: 500, message: 'Invalid database preset' })
    await $signup({
      ..._credentials,
    }, { database: authDatabase, token: false }).then(async ({ result }) => {
      await getSessionExp(result).then(async ({ result: query }) => {
        setToken(query[0].result[0].exp).value = result
        await refreshInfo(result)
      })
    })
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
