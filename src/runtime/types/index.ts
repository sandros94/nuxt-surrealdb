import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { ConnectOptions, Surreal } from 'surrealdb'

export type { Surreal, SurrealSession } from 'surrealdb'

/* Helper Types */

export type MaybePromise<T> = T | Promise<T>

export type ParseType<T> = {
  [K in keyof T]: T[K];
} & {}

/* Databases */

export interface SurrealDatabaseOptions {
  endpoint?: string
  connectOptions?: ConnectOptions
}

export type SurrealClientRuntimeConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = ParseType<Omit<PublicRuntimeConfig['surrealdb'], 'memory' | 'local' | 'wasmEngine'> & T>
export type SurrealServerRuntimeConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = ParseType<SurrealClientRuntimeConfig<T> & Omit<RuntimeConfig['surrealdb'], 'memory' | 'local' | 'nodeEngine'> & T>

/* Wasm */

interface CapabilitiesAllowDenyList {
  allow?: boolean | string[]
  deny?: boolean | string[]
}
export interface SurrealEngineOptions {
  strict?: boolean
  query_timeout?: number
  transaction_timeout?: number
  capabilities?: boolean | {
    scripting?: boolean
    guest_access?: boolean
    live_query_notifications?: boolean
    functions?: boolean | string[] | CapabilitiesAllowDenyList
    network_targets?: boolean | string[] | CapabilitiesAllowDenyList
    experimental?: boolean | string[] | CapabilitiesAllowDenyList
  }
}

/* Module */

export interface SurrealClientOptions extends SurrealDatabaseOptions {
  autoConnect?: boolean
}
export interface SurrealServerOptions extends SurrealDatabaseOptions {
  /**
   * When passing the H3Event, whether to create a new session or fork from the default session.
   *
   * @default 'new'
   */
  session?: 'new' | 'fork'
  autoConnect?: boolean
}

export interface ModuleOptions {
  autoImport?: boolean
  autoImportExpressions?: boolean
  disableWasmEngine?: boolean
  disableNodeEngine?: boolean
  client?: SurrealClientOptions & {
    /**
     * When establishing a connection, prefer using the HTTP protocol over WebSockets.
     *
     * @default true in SSR contexts, false in CSR contexts
     */
    preferHttp?: boolean
    memory?: Omit<SurrealClientOptions, 'endpoint'> & {
      wasmEngine?: SurrealEngineOptions
    }
    local?: SurrealClientOptions & {
      wasmEngine?: SurrealEngineOptions
    }
  }
  server?: SurrealServerOptions & {
    /**
     * When establishing a connection, prefer using the HTTP protocol over WebSockets.
     *
     * @default true
     */
    preferHttp?: boolean
    memory?: Omit<SurrealServerOptions, 'endpoint'> & {
      nodeEngine?: SurrealEngineOptions
    }
    local?: SurrealServerOptions & {
      nodeEngine?: SurrealEngineOptions
    }
  }
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    surrealdb: ModuleOptions['client']
  }
  interface RuntimeConfig {
    surrealdb: ModuleOptions['server']
  }
}

export interface SurrealHooks<T extends SurrealClientOptions | SurrealServerOptions> {
  'surrealdb:init': (args: { client: Surreal, config: T }) => MaybePromise<void>
  'surrealdb:connected': (args: { client: Surreal }) => MaybePromise<void>

  'surrealdb:memory:init': (args: { client: Surreal, config: T }) => MaybePromise<void>
  'surrealdb:memory:connected': (args: { client: Surreal }) => MaybePromise<void>

  'surrealdb:local:init': (args: { client: Surreal, config: T }) => MaybePromise<void>
  'surrealdb:local:connected': (args: { client: Surreal }) => MaybePromise<void>
}

declare module '#app' {
  interface NuxtApp {
    $surreal: Surreal
    $surrealLocal: Surreal | null
    $surrealMemory: Surreal | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $surreal: Surreal
    $surrealLocal: Surreal | null
    $surrealMemory: Surreal | null
  }
}
