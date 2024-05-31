import type { PublicRuntimeConfig } from '@nuxt/schema'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'

/* Database Overrides */

export interface Overrides {
  database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | DatabasePreset
  token?: string | false
}

export interface DatabasePreset {
  host?: string
  NS?: string | null
  DB?: string | null
  auth?: string | {
    user: string
    pass: string
  }
}

/* useAsyncData and useFetch custom options */

export type SurrealAsyncDataOptions<T> = AsyncDataOptions<T> & Overrides & {
  key?: string
}
export type SurrealFetchOptions<T> = UseFetchOptions<T> & Overrides
export type SurrealRpcOptions<T> = Omit<SurrealFetchOptions<RpcResponse<T>>, 'method' | 'body'>

/* Utils */

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

export type JSONPatchPath<T> = T extends object ? {
  [K in keyof T]-?: K extends string ? `/${K}` | `/${K}${Path<T[K]>}` : never
}[keyof T] : ''

export type JSONPatchValue<T, P extends string> = P extends `${infer K}/${infer Rest}`
  ? K extends keyof T
    ? Rest extends JSONPatchPath<T[K]>
      ? JSONPatchValue<T[K], Rest>
      : T[K]
    : never
  : P extends keyof T
    ? T[P]
    : never

export type JSONPatch<T> = {
  op: 'add' | 'remove' | 'replace' | 'copy' | 'move' | 'test'
  from?: JSONPatchPath<T>
  path: JSONPatchPath<T>
  value?: JSONPatchValue<T, JSONPatchPath<T>>
}

/* SurrealDB RPC Methods and Params types */

type CreateParams<T> = [
  thing: string,
  data?: Partial<T>,
]

type InsertParams<T> = [
  thing: string,
  data?: Partial<T>,
]

type MergeParams<T> = [
  thing: string,
  data: Partial<T>,
]

type PatchParams<T> = [
  thing: string,
  patches: JSONPatch<T>[],
  diff?: boolean,
]

type QueryParams = [
  sql: string,
  vars?: Record<string, any>,
]

type SignInParams<T = { [key: string]: string | undefined }> = [{
  NS?: string
  DB?: string
  SC?: string
  user?: string
  pass?: string
} & T]

type SignUpParams<T = { [key: string]: string }> = [{
  NS?: string
  DB?: string
  SC?: string
} & T]

type UpdateParams<T> = [
  thing: string,
  data?: Partial<T>,
]

type UseParams = [
  NS?: string,
  DB?: string,
]

export interface RpcMethods<T> {
  authenticate: [string]
  create: CreateParams<T>
  delete: [string]
  info: never
  insert: InsertParams<T>
  invalidate: never
  merge: MergeParams<T>
  patch: PatchParams<T>
  query: QueryParams
  select: [string]
  signin: SignInParams<T>
  signup: SignUpParams<T>
  update: UpdateParams<T>
  use: UseParams
}

export interface RpcMethodsWS<T> extends RpcMethods<T> {
  kill: [string]
  let: [
    name: string,
    value: any,
  ]
  live: [
    table: string,
    diff?: Partial<T>,
  ]
  unset: [string]
}

export type RpcParams<T, M extends keyof RpcMethods<T>> = RpcMethods<T>[M]
export type RpcParamsWS<T, M extends keyof RpcMethodsWS<T>> = RpcMethodsWS<T>[M]

/* SurrealDB RPC Request and Response types */

export interface RpcRequest<
  T = any,
  M extends keyof RpcMethods<T> = keyof RpcMethods<T>,
  P extends RpcParams<T, M> = RpcParams<T, M>,
> {
  method: M
  params: P
}

export interface RpcRequestWS<
  T = any,
  M extends keyof RpcMethodsWS<T> = keyof RpcMethods<T>,
  P extends RpcParamsWS<M, T> = RpcParamsWS<M, T>,
> {
  method: M
  params: P
}

type Test = RpcRequest<any, 'create'>

export interface RpcResponseOk<R> {
  result: R
  error?: never
}

export interface RpcResponseError {
  result?: never
  error: {
    code: number
    message: string
  }
}

export type RpcResponse<R> = RpcResponseOk<R> | RpcResponseError
export type RpcRes<R> = RpcResponse<R>

/* SurrealDB HTTP Response types */

export interface HttpResponseOk<R> {
  result: R
  status: 'OK'
  time: string
}

export interface HttpResponseError {
  result: string
  status: 'ERR'
  time: string
}

export type HttpResponse<R> = Array<(HttpResponseOk<R> | HttpResponseError)>
export type HttpRes<R> = HttpResponse<R>
