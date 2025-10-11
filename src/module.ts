import { defineNuxtModule, createResolver, addPlugin, addImports, addServerImports, addServerPlugin, addImportsSources } from '@nuxt/kit'
import { resolveModulePath } from 'exsolve'
import type { Surreal } from 'surrealdb'
import type { Import } from 'unimport'
import { defu } from 'defu'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
  SurrealClientConfig,
  SurrealServerConfig,
} from './runtime/types'

interface SurrealOptionsClient extends SurrealDatabaseOptions {
  wasmEngine?: SurrealEngineOptions
}
interface SurrealOptionsServer extends SurrealDatabaseOptions {
  nodeEngine?: SurrealEngineOptions
}

export interface ModuleOptions {
  autoImports?: boolean
  disableWasmEngine?: boolean
  disableNodeEngine?: boolean
  client?: SurrealOptionsClient & {
    memory?: SurrealOptionsClient
    local?: SurrealOptionsClient
  }
  server?: SurrealOptionsServer & {
    memory?: SurrealOptionsServer
    local?: SurrealOptionsServer
  }
}

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
              endpoint: 'mem://',
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
              endpoint: 'mem://',
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
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'memory.client'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'memory.server'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'local.client'))
      addPlugin(resolve(runtimeDir, 'app', 'plugins', 'local.server'))
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
        'useSurrealPing',
        'useSurrealInfo',
        'useSurrealQuery',
        'useSurrealSelect',
        'useSurrealVersion',
        'useSurrealRun',
        'useSurrealRpc',
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
      // TODO: add auto-import types
      addImportsSources({
        from: 'surrealdb',
        imports: [
          'Uuid',
          'RecordId',
          'StringRecordId',
          'BoundIncluded',
          'BoundExcluded',
          'RecordIdRange',
          'Future',
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
          'encodeCbor',
          'decodeCbor',
          'Surreal',
        ],
      })
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

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    surrealdb: ModuleOptions['client']
  }
  interface RuntimeConfig {
    surrealdb: ModuleOptions['server']
  }
  interface NuxtHooks {
    'surrealdb:memory:connected': (client: Surreal, config: SurrealClientConfig) => void | Promise<void>
    'surrealdb:local:connected': (client: Surreal, config: SurrealClientConfig) => void | Promise<void>
  }
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'surrealdb:memory:connected': (client: Surreal, config: SurrealServerConfig) => void | Promise<void>
    'surrealdb:local:connected': (client: Surreal, config: SurrealServerConfig) => void | Promise<void>
  }
}
