// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import { createWasmWorkerEngines } from '@surrealdb/wasm'
// @ts-expect-error - No types for the worker
import WorkerAgent from '@surrealdb/wasm/worker?worker'
import { Surreal, Value } from 'surrealdb'
import { markRaw } from 'vue'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'surrealdb:local',
  enforce: 'pre',
  parallel: true,
  setup(nuxtApp) {
    const { local: { wasmEngine } = {} } = nuxtApp.$config.public.surrealdb || {}

    const client = new Surreal({
      engines: createWasmWorkerEngines({
        ...wasmEngine,
        createWorker: () => new WorkerAgent(),
      }),
      codecOptions: {
        valueDecodeVisitor: value => value instanceof Value ? markRaw(value) : value,
      },
    })

    return {
      provide: {
        surrealLocal: client,
      },
    }
  },
})
