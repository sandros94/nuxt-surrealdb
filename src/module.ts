import type { PublicRuntimeConfig } from 'nuxt/schema'
import { defineNuxtModule, addPlugin, addImportsDir, addServerImportsDir, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

import type { DatabasePreset } from './runtime/types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  databases?: {
    default?: DatabasePreset
    [key: string]: DatabasePreset | undefined
  }
  auth?: {
    database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | false
    sessionName?: string
    cookieName?: string
    sameSite?: boolean | 'strict' | 'lax' | 'none'
    maxAge?: number
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-surrealdb',
    configKey: 'surrealdb',
  },
  defaults: {
    databases: {
      default: {
        host: '',
        NS: '',
        DB: '',
        SC: '',
        auth: '',
      },
    },
    auth: {
      database: 'default',
      sessionName: 'nuxt-session',
      cookieName: 'nuxt-surrealdb',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.surrealdb = defu<
      PublicRuntimeConfig['surrealdb'],
      ModuleOptions[]
    >(
      nuxt.options.runtimeConfig.public.surrealdb,
      options,
    )

    nuxt.options.alias['#surreal-auth'] = resolve('./runtime', 'types', 'auth')

    addPlugin(resolve('./runtime', 'plugin'))
    addImportsDir(resolve('./runtime', 'composables'))
    addServerImportsDir(resolve('./runtime', 'server', 'utils'))
  },
})
