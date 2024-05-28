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
