import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { createWasmWorkerEngines } from '@surrealdb/wasm'
import type { createNodeEngines } from '@surrealdb/node'
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

export type SurrealWasmEngineOptions = NonNullable<Parameters<typeof createWasmWorkerEngines>[0]>

/* Node */

export type SurrealNodeEngineOptions = NonNullable<Parameters<typeof createNodeEngines>[0]>

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
      wasmEngine?: SurrealWasmEngineOptions
    }
    local?: SurrealClientOptions & {
      wasmEngine?: SurrealWasmEngineOptions
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
      nodeEngine?: SurrealNodeEngineOptions
    }
    local?: SurrealServerOptions & {
      nodeEngine?: SurrealNodeEngineOptions
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
  'surrealdb:connecting': (args: { client: Surreal, config: T }) => MaybePromise<void>
  'surrealdb:connected': (args: { client: Surreal }) => MaybePromise<void>

  'surrealdb:memory:connecting': (args: { client: Surreal, config: T }) => MaybePromise<void>
  'surrealdb:memory:connected': (args: { client: Surreal }) => MaybePromise<void>

  'surrealdb:local:connecting': (args: { client: Surreal, config: T }) => MaybePromise<void>
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
