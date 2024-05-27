import { defineNuxtModule, addPlugin, addImportsDir, createResolver } from '@nuxt/kit'
import { defu } from 'defu'

interface Database {
  ns?: string
  db?: string
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  url: string
  databases: {
    default: Database
    [key: string]: Database | undefined
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
    url: '',
    databases: {
      default: {
        ns: '',
        db: '',
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
