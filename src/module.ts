import { defineNuxtModule, addPlugin, addImportsDir, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

import type { DatabasePreset } from './runtime/types'

// Module options TypeScript interface definition
export interface ModuleOptions {
  databases: {
    default?: DatabasePreset
    [key: string]: DatabasePreset | undefined
  }
  tokenCookieName: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-surrealdb',
    configKey: 'surrealdb',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    databases: {
      default: {
        host: '',
        NS: '',
        DB: '',
      },
    },
    tokenCookieName: 'surrealdb_token',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.surrealdb = defu(
      nuxt.options.runtimeConfig.public.surrealdb,
      options,
    )

    addPlugin(resolve('./runtime', 'plugin'))
    addImportsDir(resolve('./runtime', 'composables'))
  },
})
