import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import { defu } from 'defu'

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

  const defaultDB = defu(
    {
      host: envVariable(`DATABASES_DEFAULT_HOST`, true),
      ws: envVariable(`DATABASES_DEFAULT_WS`, true),
      NS: envVariable(`DATABASES_DEFAULT_NS`, true),
      DB: envVariable(`DATABASES_DEFAULT_DB`, true),
      SC: envVariable(`DATABASES_DEFAULT_SC`, true),
      AC: envVariable(`DATABASES_DEFAULT_AC`, true),
    },
    pubSurrealdb.databases.default,
    options.databases.default,
  )
  for (const _db in pubSurrealdb.databases) {
    const db = _db as keyof typeof pubSurrealdb.databases
    pubSurrealdb.databases[db] = defu(
      {
        host: envVariable(`DATABASES_${db}_HOST`, true),
        ws: envVariable(`DATABASES_${db}_WS`, true),
        NS: envVariable(`DATABASES_${db}_NS`, true),
        DB: envVariable(`DATABASES_${db}_DB`, true),
        SC: envVariable(`DATABASES_${db}_SC`, true),
        AC: envVariable(`DATABASES_${db}_AC`, true),
      },
      pubSurrealdb.databases[db],
      options.databases[db],
      defaultDB,
    )
  }

  // Private RuntimeConfig
  runtimeConfig.surrealdb = defu<
    RuntimeConfig['surrealdb'],
    ModuleOptions['server'][]
  >(
    runtimeConfig.surrealdb,
    options.server,
    {
      databases: pubSurrealdb.databases,
    },
  )

  return runtimeConfig
}
