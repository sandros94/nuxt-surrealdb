// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createWasmWorkerEngines } from '@surrealdb/wasm'
// @ts-expect-error - No types for the worker
import WorkerAgent from '@surrealdb/wasm/worker?worker'
import { Surreal } from 'surrealdb'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:memory',
  enforce: 'pre',
  parallel: true,
  setup(nuxtApp) {
    const { memory: { wasmEngine } = {} } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createWasmWorkerEngines({
        ...wasmEngine,
        createWorker: () => new WorkerAgent(),
      }),
    })

    return {
      provide: {
        surrealMemory: client,
      },
    }
  },
})
