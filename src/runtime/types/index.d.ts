import type { PublicRuntimeConfig } from 'nuxt/schema'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { FetchOptions, ResponseType } from 'ofetch'

export type * from './auth'

/* Database Overrides */

export type AuthToken = string | {
  user: string
  pass: string
}

export interface Overrides {
  database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | DatabasePreset
  token?: AuthToken | boolean
}

export interface DatabasePreset {
  host?: string
  ws?: string
  NS?: string
  DB?: string
  SC?: string
  auth?: AuthToken
}

/* useAsyncData and useFetch custom options */

export type SurrealAsyncDataOptions<T> = AsyncDataOptions<T> & Overrides & {
  key?: string
}
export type SurrealFetchOptions<
  T extends ResponseType = ResponseType,
> = Omit<FetchOptions<T>, 'method'> & {
  method?: Uppercase<SurrealMethods> | SurrealMethods
}
export type UseSurrealFetchOptions<T> = UseFetchOptions<T> & Overrides
export type UseSurrealRpcOptions<T> = Omit<UseSurrealFetchOptions<T>, 'method' | 'body' | 'onResponse'>

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

export type SurrealMethods = 'get' | 'post' | 'put' | 'patch' | 'delete'

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

// TODO: Check if it is possible to not use Record<string, string | undefined>
type SignInParams = [Record<string, string | undefined>]

type SignUpParams = [{
  NS: string
  DB: string
  SC: string
  [key: string]: string
}]

type UpdateParams<T> = [
  thing: string,
  data?: Partial<T>,
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
  signin: SignInParams
  signup: SignUpParams
  update: UpdateParams<T>
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
  use: [
    NS?: string,
    DB?: string,
  ]
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
  params?: P
}

export interface RpcRequestWS<
  T = any,
  M extends keyof RpcMethodsWS<T> = keyof RpcMethodsWS<T>,
  P extends RpcParamsWS<T, M> = RpcParamsWS<T, M>,
> {
  method: M
  params?: P
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
