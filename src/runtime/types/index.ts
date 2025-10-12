import type { PublicRuntimeConfig, RuntimeConfig } from '@nuxt/schema'
import type { Prettify, ConnectOptions } from 'surrealdb'

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
