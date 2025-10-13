import { defineNuxtModule, createResolver, addPlugin, addImports, addServerImports, addServerPlugin, addImportsSources } from '@nuxt/kit'
import { resolveModulePath } from 'exsolve'
import type { Import } from 'unimport'
import { defu } from 'defu'

import type { ModuleOptions } from './runtime/types'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'surrealdb',
    configKey: 'surrealdb',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')

    nuxt.options.alias['#surrealdb'] = runtimeDir

    const runtimeConfig = nuxt.options.runtimeConfig || {}
    const publicRuntimeConfig = runtimeConfig.public || {}

    const [wasmModule, nodeModule] = [
      tryImport('@surrealdb/wasm'),
      tryImport('@surrealdb/node'),
    ]

    const defConnOpts = {
      namespace: '',
      database: '',
    }
    publicRuntimeConfig.surrealdb = defu(
      publicRuntimeConfig.surrealdb,
      options.client,
      {
        endpoint: '',
        connectOptions: defConnOpts,
        memory: wasmModule
          ? {
              connectOptions: defConnOpts,
            }
          : undefined,
        local: wasmModule
          ? {
              endpoint: 'indxdb://',
              connectOptions: defConnOpts,
            }
          : undefined,
      },
    ) as ModuleOptions['client']
    runtimeConfig.surrealdb = defu(
      runtimeConfig.surrealdb,
      options.server,
      {
        memory: nodeModule
          ? {
              connectOptions: defConnOpts,
            }
          : undefined,
        local: nodeModule
          ? {
              endpoint: '',
              connectOptions: defConnOpts,
            }
          : undefined,
      },
    ) as ModuleOptions['server']

    // Adapt Vite config to support top-level-await and avoid esbuild errors with wasm
    nuxt.options.vite ||= {}
    nuxt.options.vite.optimizeDeps ||= {}
    nuxt.options.vite.optimizeDeps.exclude ||= []
    nuxt.options.vite.optimizeDeps.exclude.push('@surrealdb/wasm')

    const imports: Import[] = []
    const serverImports: Import[] = []
    if (options.disableWasmEngine !== true && wasmModule === true) {
      imports.push(
        {
          from: resolve(runtimeDir, 'app', 'composables', 'surreal-wasm'),
          name: 'useSurreal',
        },
        {
          from: resolve(runtimeDir, 'app', 'composables', 'surreal-memory'),
          name: 'useSurrealMem',
        },
        {
          from: resolve(runtimeDir, 'app', 'composables', 'surreal-local'),
          name: 'useSurrealLocal',
        },
      )
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'memory.server'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'memory.client'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'local.server'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'local.client'))
    }
    else {
      imports.push({
        from: resolve(runtimeDir, 'app', 'composables', 'surreal'),
        name: 'useSurreal',
      })
    }
    if (options.disableNodeEngine !== true && nodeModule === true) {
      serverImports.push(
        {
          from: resolve(runtimeDir, 'server', 'utils', 'surreal-node'),
          name: 'useSurreal',
        },
        {
          from: resolve(runtimeDir, 'server', 'utils', 'surreal-memory'),
          name: 'useSurrealMem',
        },
        {
          from: resolve(runtimeDir, 'server', 'utils', 'surreal-local'),
          name: 'useSurrealLocal',
        },
      )
    }
    else {
      serverImports.push({
        from: resolve(runtimeDir, 'server', 'utils', 'surreal'),
        name: 'useSurreal',
      })
    }

    imports.push(
      ...[
        'useSurrealAuth',
        // TODO: rewrite query and select
        // 'useSurrealQuery',
        // 'useSurrealSelect',
        'useSurrealVersion',
        'useSurrealRun',
        'useSurrealExport',
        'useSurrealImport',
      ].map(c => ({
        from: resolve(runtimeDir, 'app', 'composables', 'ssr-safe'),
        name: c,
      })),
    )

    addImports(imports)
    addServerImports(serverImports)
    addServerPlugin(resolve(runtimeDir, 'server', 'plugins', 'clear'))

    if (options.autoImports !== false) {
      const names = [
        'Uuid',
        'RecordId',
        'StringRecordId',
        'BoundIncluded',
        'BoundExcluded',
        'RecordIdRange',
        'Duration',
        'Decimal',
        'Table',
        'Geometry',
        'GeometryPoint',
        'GeometryLine',
        'GeometryPolygon',
        'GeometryMultiPoint',
        'GeometryMultiLine',
        'GeometryMultiPolygon',
        'GeometryCollection',
        'Surreal',
      ]
      addImportsSources({
        from: 'surrealdb',
        imports: names,
      })
      addServerImports(
        names.map(n => ({
          from: 'surrealdb',
          name: n,
        })),
      )
      // TODO: add types auto-import
    }
  },
})

function tryImport(pkg: string): boolean {
  try {
    const m = resolveModulePath(pkg, { from: import.meta.url })
    return typeof m === 'string' && m.length > 0
  }
  catch {
    return false
  }
}
