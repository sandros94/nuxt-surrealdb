import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import { createDefu, defu } from 'defu'

import type { ModuleOptions } from './module'

export function readenvVariable(runtimeConfig: RuntimeConfig) {
  return function (env: string, pbl?: boolean): string | undefined {
    if (!pbl) return process.env[`${runtimeConfig.nitro?.envPrefix || 'NUXT_'}SURREALDB_${env}`]
    return process.env[`${runtimeConfig.nitro?.envPrefix || 'NUXT_'}PUBLIC_SURREALDB_${env}`]
  }
}

export function surrealdbRuntimeConfig(
  runtimeConfig: RuntimeConfig,
  options: ModuleOptions,
): RuntimeConfig {
  const envVariable = readenvVariable(runtimeConfig)

  // Public RuntimeConfig
  const pubSurrealdb = runtimeConfig.public.surrealdb = defu<
    PublicRuntimeConfig['surrealdb'],
    Omit<ModuleOptions, 'server'>[]
  >(
    runtimeConfig.public.surrealdb,
    {
      auth: options.auth,
      databases: options.databases,
    },
  )
  // Inherit public database properties from default database
  const defDB = {
    host: envVariable(`DATABASES_DEFAULT_HOST`, true) || '',
    ws: envVariable(`DATABASES_DEFAULT_WS`, true) || undefined,
    NS: envVariable(`DATABASES_DEFAULT_NS`, true) || undefined,
    DB: envVariable(`DATABASES_DEFAULT_DB`, true) || undefined,
    SC: envVariable(`DATABASES_DEFAULT_SC`, true) || undefined,
    AC: envVariable(`DATABASES_DEFAULT_AC`, true) || undefined,
  }
  const defuDatabases = createDefu((obj, key, value) => {
    if (key === 'default') return false
    obj[key] = defu(
      value,
      defDB,
    )
    return true
  })
  pubSurrealdb.databases = defuDatabases(
    pubSurrealdb.databases,
    {
      default: defDB,
    },
  )

  // Private RuntimeConfig
  runtimeConfig.surrealdb = defu<
    RuntimeConfig['surrealdb'],
    ModuleOptions['server'][]
  >(
    runtimeConfig.surrealdb,
    options.server,
  )

  return runtimeConfig
}
