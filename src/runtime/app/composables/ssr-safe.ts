import { jsonify, Surreal } from 'surrealdb'
import type {
  Prettify,
  ActionResult,
  RecordId,
  StringRecordId,
  RecordIdRange,
  Table,
  Jsonify,
  QueryParameters,
  RpcResponse,
  ExportOptions,
} from 'surrealdb'
import type {
  AsyncData,
  AsyncDataOptions,
  NuxtError,
} from '#app'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
} from '#surrealdb/types'
import { type MaybeRef, toRef, useSurreal, useAsyncData } from '#imports'

type R = Prettify<Record<string, unknown>>
type RecordId$1<Tb extends string = string> = RecordId<Tb> | StringRecordId
type PickFrom<T, K extends Array<string>> = T extends Array<any> ? T : T extends Record<string, any> ? keyof T extends K[number] ? T : K[number] extends never ? T : Pick<T, K[number]> : T
type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>
type _AsyncDataOptions<T, DefaultT> = AsyncDataOptions<T, T, KeysOf<T>, DefaultT>
type _AsyncData<T, ErrorT, DefaultT> = AsyncData<PickFrom<T, KeysOf<T>> | DefaultT, (ErrorT extends Error | NuxtError ? ErrorT : NuxtError<ErrorT>) | undefined>

async function getClient<
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>) {
  return clientOrOptions instanceof Surreal
    ? clientOrOptions
    : (await useSurreal(clientOrOptions)).client
}

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
  wasmEngine?: SurrealEngineOptions
  mergeConfig?: M
  preferHttp?: boolean
  autoConnect?: boolean
} & T

// #region useSurrealPing

export async function useSurrealPing<
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  asyncDataOptions?: _AsyncDataOptions<true, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<true, ErrorT, DefaultT>> {
  const { key = 'surreal:ping', ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.ping()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealPing

// #region useSurrealInfo

export async function useSurrealInfo<
  T extends R,
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  asyncDataOptions?: _AsyncDataOptions<Jsonify<ActionResult<T>>, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<Jsonify<ActionResult<T>>, ErrorT, DefaultT>> {
  const { key = 'surreal:info', ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.info<T>()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealInfo

// #region useSurrealQuery

export async function useSurrealQuery<
  T extends unknown[],
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  query: MaybeRef<QueryParameters>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<T>, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<Jsonify<T>, ErrorT, DefaultT>> {
  const queryRef = toRef(query)
  const { key = `surreal:query:${queryRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.query<T>(...(queryRef.value as QueryParameters))

      return jsonify(res)
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), queryRef],
    },
  )
}

// #endregion useSurrealQuery

// #region useSurrealSelect

export async function useSurrealSelect<
  T extends R,
  Thing extends RecordId$1 | RecordIdRange | Table | string,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  thing: MaybeRef<Thing>,
  asyncDataOptions?: _AsyncDataOptions<
    Thing extends RecordId$1
      ? Jsonify<ActionResult<T>>
      : Jsonify<ActionResult<T>[]>,
    DefaultT
  > & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<
  Thing extends RecordId$1
    ? Jsonify<ActionResult<T>>
    : Jsonify<ActionResult<T>[]>,
  NuxtError | undefined,
  DefaultT
>> {
  const thingRef = toRef(thing)
  const { key = `surreal:select:${thingRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.select<T>(thingRef.value as any)

      return jsonify(res) as Thing extends RecordId$1
        ? Jsonify<ActionResult<T>>
        : Jsonify<ActionResult<T>[]>
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), thingRef],
    },
  )
}

// #endregion useSurrealSelect

// #region useSurrealVersion

export async function useSurrealVersion<
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  asyncDataOptions?: _AsyncDataOptions<string, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<string, ErrorT, DefaultT>> {
  const { key = 'surreal:version', ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.version()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealVersion

// #region useSurrealRun

export async function useSurrealRun<
  T,
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  name: MaybeRef<string>,
  args?: MaybeRef<unknown[]>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<T>, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<Jsonify<T>, ErrorT, DefaultT>> {
  const nameRef = toRef(name)
  const argsRef = toRef(args)
  const { key = `surreal:run:${nameRef.value.toString()}:${argsRef.value?.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.run<T>(nameRef.value, argsRef.value)

      return jsonify(res)
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), nameRef, argsRef],
    },
  )
}

// #endregion useSurrealRun

// #region useSurrealRpc

export async function useSurrealRpc<
  T,
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  method: MaybeRef<string>,
  params?: MaybeRef<unknown[]>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<RpcResponse<T>>, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<Jsonify<RpcResponse<T>>, ErrorT, DefaultT>> {
  const methodRef = toRef(method)
  const paramsRef = toRef(params)
  const { key = `surreal:run:${methodRef.value.toString()}:${paramsRef.value?.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.rpc<T>(methodRef.value, paramsRef.value)

      return jsonify(res)
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), methodRef, paramsRef],
    },
  )
}

// #endregion useSurrealRpc

// #region useSurrealExport

export async function useSurrealExport<
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  options: MaybeRef<ExportOptions>,
  asyncDataOptions?: _AsyncDataOptions<string, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<string, ErrorT, DefaultT>> {
  const optionsRef = toRef(options)
  const { key = `surreal:run:${optionsRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      const res = await client.export(optionsRef.value)

      return jsonify(res)
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), optionsRef],
    },
  )
}

// #endregion useSurrealExport

// #region useSurrealImport

export async function useSurrealImport<
  ErrorT,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
  DefaultT = undefined,
>(
  input: MaybeRef<string>,
  asyncDataOptions?: _AsyncDataOptions<true, DefaultT> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
): Promise<_AsyncData<true, ErrorT, DefaultT>> {
  const inputRef = toRef(input)
  const { key = `surreal:run:${inputRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const client = await getClient(clientOrOptions)
      await client.import(inputRef.value)

      return true as const
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), inputRef],
    },
  )
}

// #endregion useSurrealImport
