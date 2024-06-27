import type { PublicRuntimeConfig, RuntimeConfig } from 'nuxt/schema'
import { defineNuxtModule, addPlugin, addImportsDir, addServerImportsDir, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

import type { DatabasePreset } from './runtime/types'

export type * from './runtime/types'

type PublicDatabases = PublicRuntimeConfig['surrealdb']['databases']

// Module options TypeScript interface definition
export interface ModuleOptions {
  auth?: {
    adminMaxAge?: number
    database?: keyof PublicDatabases | false
    sessionName?: string
    cookieName?: string
    sameSite?: boolean | 'strict' | 'lax' | 'none'
  }
  defaultDatabase?: keyof PublicDatabases
  databases?: {
    default?: DatabasePreset
    [key: string]: DatabasePreset | undefined
  }
  server?: {
    defaultDatabase?: keyof PublicDatabases | keyof RuntimeConfig['surrealdb']['databases']
    databases?: {
      [key: string]: DatabasePreset | undefined
    }
  }
  unwrapRpcResponse?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-surrealdb',
    configKey: 'surrealdb',
    compatibility: {
      nuxt: '>=3.10.0',
    },
  },
  defaults: {
    auth: {
      adminMaxAge: 60 * 60 * 24 * 7,
      database: 'default',
      sessionName: 'nuxt-session',
      cookieName: 'nuxt-surrealdb',
      sameSite: 'lax',
    },
    defaultDatabase: 'default',
    databases: {
      default: {
        host: '',
        ws: '',
        NS: '',
        DB: '',
        SC: '',
        auth: '',
      },
    },
    server: {
      defaultDatabase: 'default',
    },
    unwrapRpcResponse: true,
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Transpile runtime
    const runtimeDir = resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.alias['#surrealdb'] = runtimeDir

    // Public RuntimeConfig
    nuxt.options.runtimeConfig.public.surrealdb = defu<
      PublicRuntimeConfig['surrealdb'],
      Omit<ModuleOptions, 'server'>[]
    >(
      nuxt.options.runtimeConfig.public.surrealdb,
      {
        auth: options.auth,
        databases: options.databases,
        defaultDatabase: options.defaultDatabase,
        unwrapRpcResponse: options.unwrapRpcResponse,
      },
    )
    // Private RuntimeConfig
    nuxt.options.runtimeConfig.surrealdb = defu<
      RuntimeConfig['surrealdb'],
      ModuleOptions['server'][]
    >(
      nuxt.options.runtimeConfig.surrealdb,
      {
        databases: options.server?.databases,
        defaultDatabase: options.server?.defaultDatabase,
      },
    )

    addPlugin(resolve(runtimeDir, 'plugin'))
    addImportsDir(resolve(runtimeDir, 'composables'))
    addServerImportsDir(resolve(runtimeDir, 'server', 'utils'))
  },
})
