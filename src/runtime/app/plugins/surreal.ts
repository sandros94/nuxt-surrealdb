// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { Surreal, createRemoteEngines } from 'surrealdb'

import { defineNuxtPlugin, surrealHooks } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:client',
  enforce: 'pre',
  parallel: true,
  async setup(nuxtApp) {
    const { local, memory, ...config } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createRemoteEngines(),
    })

    await surrealHooks.callHookParallel('surrealdb:init', { client, config })

    return {
      provide: {
        surreal: client,
      },
    }
  },
})
