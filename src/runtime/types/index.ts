import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { Prettify, ConnectOptions, Surreal } from 'surrealdb'

/* Databases */

export interface SurrealDatabaseOptions {
  endpoint?: string
  connectOptions?: ConnectOptions
}

export type SurrealClientRuntimeConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = Prettify<Omit<PublicRuntimeConfig['surrealdb'], 'memory' | 'local' | 'wasmEngine'> & T>
export type SurrealServerRuntimeConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = Prettify<SurrealClientRuntimeConfig<T> & Omit<RuntimeConfig['surrealdb'], 'memory' | 'local' | 'nodeEngine'> & T>

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

declare module '#app' {
  interface RuntimeNuxtHooks {
    'surrealdb:init': (client: Surreal, config: SurrealClientOptions) => void | Promise<void>
    'surrealdb:memory:init': (client: Surreal, config: Omit<SurrealClientOptions, 'endpoint'>) => void | Promise<void>
    'surrealdb:local:init': (client: Surreal, config: SurrealClientOptions) => void | Promise<void>
    'surrealdb:connected': (client: Surreal, config: SurrealClientOptions) => void | Promise<void>
    'surrealdb:memory:connected': (client: Surreal, config: Omit<SurrealClientOptions, 'endpoint'>) => void | Promise<void>
    'surrealdb:local:connected': (client: Surreal, config: SurrealClientOptions) => void | Promise<void>
  }
  interface NuxtApp {
    $surrealLocal: Surreal | null
    $surrealMem: Surreal | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $surrealLocal: Surreal | null
    $surrealMem: Surreal | null
  }
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'surrealdb:init': (client: Surreal, config: SurrealServerOptions) => void | Promise<void>
    'surrealdb:memory:init': (client: Surreal, config: Omit<SurrealServerOptions, 'endpoint'>) => void | Promise<void>
    'surrealdb:local:init': (client: Surreal, config: SurrealServerOptions) => void | Promise<void>
    'surrealdb:connected': (client: Surreal, config: SurrealServerOptions) => void | Promise<void>
    'surrealdb:memory:connected': (client: Surreal, config: Omit<SurrealServerOptions, 'endpoint'>) => void | Promise<void>
    'surrealdb:local:connected': (client: Surreal, config: SurrealServerOptions) => void | Promise<void>
  }
}
