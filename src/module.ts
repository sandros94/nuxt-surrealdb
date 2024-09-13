import type { PublicRuntimeConfig } from '@nuxt/schema'
import { defineNuxtModule, addPlugin, addImportsDir, addServerImportsDir, createResolver } from '@nuxt/kit'

import type { DatabasePreset } from './runtime/types'
import { surrealdbRuntimeConfig } from './init-module'

export type * from './runtime/types'

type PublicDatabases = PublicRuntimeConfig['surrealdb']['databases']

// Module options TypeScript interface definition
export interface ModuleOptions {
  auth: {
    adminMaxAge?: number
    database?: keyof PublicDatabases | false
    sessionName?: string
    cookieName?: string
    sameSite?: boolean | 'strict' | 'lax' | 'none'
  }
  databases: {
    default?: DatabasePreset
    [key: string]: Partial<DatabasePreset> | undefined
  }
  server: {
    databases?: {
      [key: string]: Partial<DatabasePreset> | undefined
    }
  }
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
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Transpile runtime
    const runtimeDir = resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.alias['#surrealdb'] = runtimeDir

    nuxt.options.runtimeConfig = surrealdbRuntimeConfig(nuxt.options.runtimeConfig, options)

    addPlugin(resolve(runtimeDir, 'plugin'))
    addImportsDir(resolve(runtimeDir, 'composables'))
    addServerImportsDir(resolve(runtimeDir, 'server', 'utils'))
  },
})

interface SurrealServerOptions {
  surrealdb?: ModuleOptions['server']
}
interface SurrealOptions {
  surrealdb?: Omit<ModuleOptions, 'server'>
}
declare module '@nuxt/schema' {
  interface RuntimeConfig extends SurrealServerOptions {}
  interface PublicRuntimeConfig extends SurrealOptions {}
}
