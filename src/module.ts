import type { PublicRuntimeConfig, RuntimeConfig } from 'nuxt/schema'
import { defineNuxtModule, addPlugin, addImportsDir, addServerImportsDir, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

import type { DatabasePreset } from './runtime/types'

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
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-surrealdb',
    configKey: 'surrealdb',
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
        NS: '',
        DB: '',
        SC: '',
        auth: '',
      },
    },
    server: {
      defaultDatabase: 'default',
    },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

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

    nuxt.options.alias['#surreal-auth'] = resolve('./runtime', 'types', 'auth')

    addPlugin(resolve('./runtime', 'plugin'))
    addImportsDir(resolve('./runtime', 'composables'))
    addServerImportsDir(resolve('./runtime', 'server', 'utils'))
  },
})
