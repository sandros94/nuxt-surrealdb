import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { ConnectOptions, Surreal, AuthOrToken } from 'surrealdb'

/* Helper Types */

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
  wasmEngine?: SurrealEngineOptions
}
export interface SurrealServerOptions extends SurrealDatabaseOptions {
  autoConnect?: boolean
  nodeEngine?: SurrealEngineOptions
}

export interface ModuleOptions {
  autoImports?: boolean
  disableWasmEngine?: boolean
  disableNodeEngine?: boolean
  client?: SurrealClientOptions & {
    memory?: Omit<SurrealClientOptions, 'endpoint'>
    local?: SurrealClientOptions
  }
  server?: SurrealServerOptions & {
    memory?: Omit<SurrealServerOptions, 'endpoint'>
    local?: SurrealServerOptions
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

export interface SurrealHooks<T extends SurrealDatabaseOptions = SurrealDatabaseOptions> {
  'surrealdb:init': (args: SurrealModuleHooksArgs<T>) => void | Promise<void>
  'surrealdb:memory:init': (args: SurrealModuleHooksArgs<Omit<T, 'endpoint'>>) => void | Promise<void>
  'surrealdb:local:init': (args: SurrealModuleHooksArgs<T>) => void | Promise<void>
  'surrealdb:authentication': (args: SurrealModuleHooksArgs<T>) => AuthOrToken | Promise<AuthOrToken>
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
