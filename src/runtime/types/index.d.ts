import type { PublicRuntimeConfig } from '@nuxt/schema'

export interface DatabasePreset {
  host?: string
  NS?: string | null
  DB?: string | null
}

export interface Overrides {
  database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | DatabasePreset
  token?: string
}

type OKResponse<T> = {
  result: T
  status: 'OK'
  time: string
}

type ErrorResponse = {
  result: string
  status: 'ERR'
  time: string
}

export type Response<T> = Array<(OKResponse<T> | ErrorResponse)>
export type Res<T> = Response<T>

export type PickFrom<T, K extends Array<string>> = T extends Array<any>
  ? T
  : T extends Record<string, any>
    ? keyof T extends K[number]
      ? T // Exact same keys as the target, skip Pick
      : K[number] extends never
        ? T
        : Pick<T, K[number]>
    : T

export type KeysOf<T> = Array<
  T extends T // Include all keys of union types, not just common keys
    ? keyof T extends string
      ? keyof T
      : never
    : never
>
