import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { ConnectOptions, Surreal, AuthOrToken, Token, NamespaceDatabase } from 'surrealdb'

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
  autoConnect?: boolean
}

export interface ModuleOptions {
  autoImport?: boolean
  autoImportExpressions?: boolean
  disableWasmEngine?: boolean
  disableNodeEngine?: boolean
  client?: SurrealClientOptions & {
    memory?: Omit<SurrealClientOptions, 'endpoint'> & {
      wasmEngine?: SurrealEngineOptions
    }
    local?: SurrealClientOptions & {
      wasmEngine?: SurrealEngineOptions
    }
  }
  server?: SurrealServerOptions & {
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

interface SurrealModuleHooksArgs<T extends SurrealDatabaseOptions = SurrealDatabaseOptions> {
  client: Surreal
  config: T
}

export interface SurrealHooks<T extends SurrealDatabaseOptions = SurrealDatabaseOptions, E = {}> {
  'surrealdb:init': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:init:authentication': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<AuthOrToken>
  'surrealdb:connecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:connected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:reconnecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:authenticated': (args: ParseType<SurrealModuleHooksArgs<T> & E & { token: Token }>) => MaybePromise<void>
  'surrealdb:disconnected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:error': (args: ParseType<SurrealModuleHooksArgs<T> & E & { error: Error }>) => MaybePromise<void>
  'surrealdb:invalidated': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:using': (args: ParseType<SurrealModuleHooksArgs<T> & E & NamespaceDatabase>) => MaybePromise<void>

  'surrealdb:memory:init': (args: ParseType<SurrealModuleHooksArgs<Omit<T, 'endpoint'>> & E>) => MaybePromise<void>
  'surrealdb:memory:connecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:memory:connected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:memory:reconnecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:memory:authenticated': (args: ParseType<SurrealModuleHooksArgs<T> & E & { token: Token }>) => MaybePromise<void>
  'surrealdb:memory:disconnected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:memory:error': (args: ParseType<SurrealModuleHooksArgs<T> & E & { error: Error }>) => MaybePromise<void>
  'surrealdb:memory:invalidated': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:memory:using': (args: ParseType<SurrealModuleHooksArgs<T> & E & NamespaceDatabase>) => MaybePromise<void>

  'surrealdb:local:init': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:connecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:connected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:reconnecting': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:authenticated': (args: ParseType<SurrealModuleHooksArgs<T> & E & { token: Token }>) => MaybePromise<void>
  'surrealdb:local:disconnected': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:error': (args: ParseType<SurrealModuleHooksArgs<T> & E & { error: Error }>) => MaybePromise<void>
  'surrealdb:local:invalidated': (args: ParseType<SurrealModuleHooksArgs<T> & E>) => MaybePromise<void>
  'surrealdb:local:using': (args: ParseType<SurrealModuleHooksArgs<T> & E & NamespaceDatabase>) => MaybePromise<void>
}

declare module '#app' {
  interface NuxtApp {
    $surrealLocal: Surreal | null
    $surrealMemory: Surreal | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $surrealLocal: Surreal | null
    $surrealMemory: Surreal | null
  }
}
