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
  AsyncDataOptions,
} from 'nuxt/app'

import type {
  SurrealDatabaseOptions,
  SurrealEngineOptions,
} from '#surrealdb/types'
import { type MaybeRef, toRef, useSurreal, useAsyncData } from '#imports'

type R = Prettify<Record<string, unknown>>
type RecordId$1<Tb extends string = string> = RecordId<Tb> | StringRecordId

export type UseSurrealOptions<M extends boolean, T extends SurrealDatabaseOptions = SurrealDatabaseOptions> = {
  wasmEngine?: SurrealEngineOptions
  mergeConfig?: M
  preferHttp?: boolean
  autoConnect?: boolean
} & T

function getClient<
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>) {
  return clientOrOptions instanceof Surreal
    ? clientOrOptions
    : useSurreal(clientOrOptions).client
}

// #region useSurrealPing

export async function useSurrealPing<
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  asyncDataOptions?: AsyncDataOptions<true> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const { key = 'surreal:ping', ...restOptions } = asyncDataOptions || {}
  return useAsyncData<true>(
    key,
    async () => {
      const res = await getClient(clientOrOptions).ping()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealPing

// #region useSurrealInfo

export async function useSurrealInfo<
  T extends R,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  asyncDataOptions?: AsyncDataOptions<Jsonify<ActionResult<T>>> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const { key = 'surreal:info', ...restOptions } = asyncDataOptions || {}
  return useAsyncData<Jsonify<ActionResult<T>>>(
    key,
    async () => {
      const res = await getClient(clientOrOptions).info<T>()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealInfo

// #region useSurrealQuery

export async function useSurrealQuery<
  T extends unknown[],
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  query: MaybeRef<QueryParameters>,
  asyncDataOptions?: AsyncDataOptions<Jsonify<T>> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const queryRef = toRef(query)
  const { key = `surreal:query:${queryRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const res = await getClient(clientOrOptions).query<T>(...(queryRef.value as QueryParameters))

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
>(
  thing: MaybeRef<Thing>,
  asyncDataOptions?: AsyncDataOptions<Thing extends RecordId$1
    ? Jsonify<ActionResult<T>>
    : Jsonify<ActionResult<T>[]>
  > & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const thingRef = toRef(thing)
  const { key = `surreal:select:${thingRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const res = await getClient(clientOrOptions).select<T>(thingRef.value as any)

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
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  asyncDataOptions?: AsyncDataOptions<string> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const { key = 'surreal:version', ...restOptions } = asyncDataOptions || {}
  return useAsyncData<string>(
    key,
    async () => {
      const res = await getClient(clientOrOptions).version()

      return jsonify(res)
    },
    restOptions,
  )
}

// #endregion useSurrealVersion

// #region useSurrealRun

export async function useSurrealRun<
  T,
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  name: MaybeRef<string>,
  args?: MaybeRef<unknown[]>,
  asyncDataOptions?: AsyncDataOptions<Jsonify<T>> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const nameRef = toRef(name)
  const argsRef = toRef(args)
  const { key = `surreal:run:${nameRef.value.toString()}:${argsRef.value?.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const res = await getClient(clientOrOptions).run<T>(nameRef.value, argsRef.value)

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
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  method: MaybeRef<string>,
  params?: MaybeRef<unknown[]>,
  asyncDataOptions?: AsyncDataOptions<Jsonify<RpcResponse<T>>> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const methodRef = toRef(method)
  const paramsRef = toRef(params)
  const { key = `surreal:run:${methodRef.value.toString()}:${paramsRef.value?.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const res = await getClient(clientOrOptions).rpc<T>(methodRef.value, paramsRef.value)

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
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  options: MaybeRef<ExportOptions>,
  asyncDataOptions?: AsyncDataOptions<string> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const optionsRef = toRef(options)
  const { key = `surreal:run:${optionsRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      const res = await getClient(clientOrOptions).export(optionsRef.value)

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
  M extends boolean,
  TOptions extends SurrealDatabaseOptions = SurrealDatabaseOptions,
>(
  input: MaybeRef<string>,
  asyncDataOptions?: AsyncDataOptions<true> & {
    key?: string
  },
  clientOrOptions?: Surreal | UseSurrealOptions<M, TOptions>,
) {
  const inputRef = toRef(input)
  const { key = `surreal:run:${inputRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useAsyncData(
    key,
    async () => {
      await getClient(clientOrOptions).import(inputRef.value)

      return true as const
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), inputRef],
    },
  )
}

// #endregion useSurrealImport
