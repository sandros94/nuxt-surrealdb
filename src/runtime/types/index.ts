import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { Prettify, ConnectOptions, Surreal } from 'surrealdb'

/* Databases */

export interface SurrealDatabaseOptions {
  endpoint?: string
  connectOptions?: ConnectOptions
}

export type SurrealClientConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = Prettify<Omit<PublicRuntimeConfig['surrealdb'], 'memory' | 'local' | 'wasmEngine'> & T>
export type SurrealServerConfig<
  T extends SurrealDatabaseOptions = SurrealDatabaseOptions,
> = Prettify<SurrealClientConfig<T> & Omit<RuntimeConfig['surrealdb'], 'memory' | 'local' | 'nodeEngine'> & T>

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

export interface SurrealOptionsClient extends SurrealDatabaseOptions {
  wasmEngine?: SurrealEngineOptions
}
export interface SurrealOptionsServer extends SurrealDatabaseOptions {
  nodeEngine?: SurrealEngineOptions
}

export interface ModuleOptions {
  autoImports?: boolean
  disableWasmEngine?: boolean
  disableNodeEngine?: boolean
  client?: SurrealOptionsClient & {
    memory?: Omit<SurrealOptionsClient, 'endpoint'>
    local?: SurrealOptionsClient
  }
  server?: SurrealOptionsServer & {
    memory?: Omit<SurrealOptionsServer, 'endpoint'>
    local?: SurrealOptionsServer
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
