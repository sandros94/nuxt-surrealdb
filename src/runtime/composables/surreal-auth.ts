import type { PublicRuntimeConfig } from 'nuxt/schema'
import { defu } from 'defu'

import type { RpcParams } from '../types'

import type { UserSession } from '#surreal-auth'
import { computed, createError, refreshCookie, useCookie, useRuntimeConfig, useState, useSurrealDB } from '#imports'

export function useSurrealAuth() {
  const {
    databases,
    auth: {
      database,
      sessionName,
      cookieName,
      maxAge,
      sameSite,
    },
  } = useRuntimeConfig().public.surrealdb
  const authDatabase = database as keyof PublicRuntimeConfig['surrealdb']['databases']
  const { $authenticate, $info, $invalidate, $signin, $signup } = useSurrealDB({ database: authDatabase })

  const session = useState<UserSession>(sessionName, () => ({}))

  // TODO: Handle token maxAge update aftert a reAuthenticate
  const token = useCookie(cookieName, { maxAge, sameSite: (sameSite as boolean | 'lax' | 'strict' | 'none'), secure: !import.meta.dev })

  // authenticate
  async function reAuthenticate() {
    if (!token.value) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await $authenticate(token.value)
    await refreshInfo()
  }

  // info
  async function refreshInfo() {
    if (!token.value) throw createError({ statusCode: 401, message: 'Unauthorized' })
    const { result } = await $info<UserSession['user']>({
      database: authDatabase,
      token: `Bearer ${token.value}`,
    })
    if (!result) return
    session.value.user = result
  }

  // invalidate
  async function invalidate() {
    if (!token.value) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await $invalidate({
      database: authDatabase,
      token: `Bearer ${token.value}`,
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
      token.value = result
      refreshCookie(cookieName)
      await refreshInfo()
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
    const { result } = await $signup<string>({
      ..._credentials,
    }, { database: authDatabase, token: false })
    if (result) {
      token.value = result
      refreshCookie(cookieName)
      await signin(_credentials)
      await refreshInfo()
    }
  }

  return {
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
