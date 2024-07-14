import type { PublicRuntimeConfig } from 'nuxt/schema'
import { defu } from 'defu'

import type { DatabasePreset, Overrides, UserSession } from '../types'

import { computed, createError, useCookie, useRuntimeConfig, useState, useSurrealDB } from '#imports'

export function useSurrealAuth(database?: Overrides['database']) {
  const {
    databases,
    auth: {
      adminMaxAge,
      database: _database,
      sessionName,
      cookieName,
      sameSite,
    },
  } = useRuntimeConfig().public.surrealdb

  const authDatabase = _database as keyof PublicRuntimeConfig['surrealdb']['databases'] | false

  function _getDatabasePreset(database: Overrides['database']): DatabasePreset {
    if (typeof database !== 'string' && typeof database !== 'number' && typeof database !== 'symbol' && database !== undefined) {
      return defu<DatabasePreset, DatabasePreset[]>(database, databases[authDatabase !== false ? authDatabase : 'default'])
    }
    else if (database !== undefined) {
      return databases[database]
    }
    else if (authDatabase !== false) {
      return databases[authDatabase]
    }
    else {
      throw createError({ statusCode: 500, message: 'No auth database provided either via Nuxt Runtime Config nor as a useSurrealAuth param' })
    }
  }

  const {
    $authenticate,
    $info,
    $invalidate,
    $query,
    $signin,
    $signup,
  } = useSurrealDB({ database: _getDatabasePreset(database) })

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
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    return (
      await $query<
        { exp: number | 'NONE' | null }
      >('SELECT exp FROM $session;', undefined, { token: _token })
    )[0].result[0]
  }

  // info
  async function refreshInfo(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    const result = await $info<UserSession['user']>({ token: _token })
    if (!result) return // Admin users don't have user info
    session.value.user = result
  }

  // invalidate
  async function invalidate(authToken?: string) {
    const _token = authToken || token.value
    if (!_token) throw createError({ statusCode: 401, message: 'Unauthorized' })
    await $invalidate({ token: _token })
      .then(() => {
        token.value = null
        session.value = {}
      })
  }

  // signin
  async function signin(credentials: Record<string, any>, o: { admin?: boolean } = {}) {
    const { NS, DB, SC } = _getDatabasePreset(database)
    if ((!NS || !DB || !SC) && !o.admin) throw createError({ statusCode: 500, message: 'Invalid database preset' })

    const result = await $signin({
      ...credentials,
      ...(!o.admin && { NS, DB, SC, AC: SC }),
    })
    if (result) {
      await getSessionExp(result).then(async ({ exp }) => {
        if (!exp) throw createError({ statusCode: 401, message: 'User is not authenticated' })
        else if (exp === 'NONE') {
          setToken(adminMaxAge).value = result
          await refreshInfo(result)
        }
        else {
          setToken(exp).value = result
          await refreshInfo(result)
        }
      })
    }
  }

  // signup
  async function signup(credentials: Record<string, any>) {
    const { NS, DB, SC } = _getDatabasePreset(database)
    if (!NS || !DB || !SC) throw createError({ statusCode: 500, message: 'Invalid database preset' })

    const result = await $signup({
      ...credentials,
      NS,
      DB,
      SC,
      AC: SC,
    })
    if (result) {
      await getSessionExp(result).then(async ({ exp }) => {
        if (!exp) throw createError({ statusCode: 401, message: 'User is not authenticated' })
        else {
          // Signup users cannot be admins
          setToken(exp as number).value = result
          await refreshInfo(result)
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
