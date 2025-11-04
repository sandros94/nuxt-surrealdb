import type {
  Surreal,
  RecordResult,
  Jsonify,
  Table,
  RecordId,
  RecordIdRange,
  Duration,
  DateTime,
  ExprLike,
  VersionInfo,
  SqlExportOptions,
} from 'surrealdb'
import type {
  AsyncDataOptions,
  NuxtError,
} from '#app'

import type {
  MaybePromise,
  ParseType,
} from '#surrealdb/types'
import { type MaybeRef, type Ref, toRef, useAsyncData, surrealHooks } from '#imports'

// Surreal types

type Field<I> = keyof I | (string & {})
type Doc = ParseType<Record<string, unknown>>
type MaybeJsonify<T, J extends boolean> = J extends true ? Jsonify<T> : T
type Collect<T extends unknown[], J extends boolean> = T extends []
  ? unknown[]
  : {
      [K in keyof T]: MaybeJsonify<T[K], J>;
    }

// AsyncData types

type PickFrom<T, K extends Array<string>> = T extends Array<any> ? T : T extends Record<string, any> ? keyof T extends K[number] ? T : K[number] extends never ? T : Pick<T, K[number]> : T
type KeysOf<T> = Array<T extends T ? keyof T extends string ? keyof T : never : never>
type _AsyncDataOptions<T, DefaultT> = AsyncDataOptions<T, T, KeysOf<T>, DefaultT>
type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'
type AsyncDataRefreshCause = 'initial' | 'refresh:hook' | 'refresh:manual' | 'watch'
interface AsyncDataExecuteOptions {
  /**
   * Force a refresh, even if there is already a pending request. Previous requests will
   * not be cancelled, but their result will not affect the data/pending state - and any
   * previously awaited promises will not resolve until this new request resolves.
   */
  dedupe?: 'cancel' | 'defer'
  cause?: AsyncDataRefreshCause
  /** @internal */
  cachedData?: any
}
export interface AsyncData<DataT, ErrorT> {
  data: Ref<DataT>
  pending: Ref<boolean>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>
  clear: () => void
  error: Ref<ErrorT | undefined>
  status: Ref<AsyncDataRequestStatus>
}
type UseSurrealAsyncData<T, ErrorT, DefaultT> = AsyncData<PickFrom<T, KeysOf<T>> | DefaultT, (ErrorT extends Error | NuxtError ? ErrorT : NuxtError<ErrorT>) | undefined>

// #region useSurrealAsyncData

export async function useSurrealAsyncData<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  key: string,
  cb: (client: Surreal) => MaybePromise<T>,
  asyncDataOptions?: _AsyncDataOptions<T, DefaultT>,
): Promise<UseSurrealAsyncData<T, ErrorT, DefaultT>> {
  const {
    data,
    error,
    pending,
    status,
    execute,
    refresh,
    clear,
  } = await useAsyncData<T, ErrorT, T, KeysOf<T>, DefaultT>(
    key,
    async (nuxtApp) => {
      const {
        $surreal: client,
        $config: {
          public: {
            surrealdb: {
              local,
              memory,
              ...config
            } = {},
          },
        },
      } = nuxtApp

      if (!client.isConnected) {
        await surrealHooks.callHookParallel('surrealdb:init', { client })

        if (config.endpoint && config.autoConnect !== false) {
          let endpoint = config.endpoint

          // prefer http for stateless hydration
          if (config.preferHttp !== false) {
            endpoint = endpoint.replace(/^ws/, 'http')
          }

          await client.connect(endpoint, config.connectOptions)
        }
      }

      return cb(client)
    },
    asyncDataOptions,
  )

  return {
    data,
    error,
    pending,
    status,
    execute,
    refresh,
    clear,
  }
}

// #endregion useSurrealAsyncData

// #region useSurrealAuth

export async function useSurrealAuth<
  T extends Doc,
  ErrorT,
  DefaultT = undefined,
>(
  asyncDataOptions?: _AsyncDataOptions<Jsonify<RecordResult<T> | undefined>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T> | undefined>, ErrorT, DefaultT>> {
  const { key = 'surreal:info', ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData<Jsonify<RecordResult<T> | undefined>, ErrorT, DefaultT>(
    key,
    async (client) => {
      const res = await client.auth<T>().json()

      return res
    },
    restOptions,
  )
}

// #endregion useSurrealAuth

// #region useSurrealExport

export async function useSurrealExport<
  ErrorT,
  DefaultT = undefined,
>(
  expOptions: MaybeRef<SqlExportOptions>,
  asyncDataOptions?: _AsyncDataOptions<string, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<string, ErrorT, DefaultT>> {
  const expOptionsRef = toRef(expOptions)
  const { key = `surreal:run:${expOptionsRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
      const res = await client.export(expOptionsRef.value)

      return res
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), expOptionsRef],
    },
  )
}

// #endregion useSurrealExport

// #region useSurrealImport

export async function useSurrealImport<
  ErrorT,
  DefaultT = undefined,
>(
  input: MaybeRef<string>,
  asyncDataOptions?: _AsyncDataOptions<true, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<true, ErrorT, DefaultT>> {
  const inputRef = toRef(input)
  const { key = `surreal:run:${inputRef.value.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
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

// #region useSurrealQuery

export async function useSurrealQuery<
  T extends unknown[],
  ErrorT,
  DefaultT = undefined,
>(
  query: MaybeRef<string>,
  bindings?: MaybeRef<Record<string, MaybeRef<unknown>>>,
  asyncDataOptions?: _AsyncDataOptions<Collect<T, true>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Collect<T, true>, ErrorT, DefaultT>> {
  const queryRef = toRef(query)
  const bindingsRef = toRef(bindings)
  const { key = `surreal:query:${queryRef.value.toString()}:${JSON.stringify(bindingsRef.value)}`, ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
      const res = await client.query(queryRef.value, bindingsRef.value).json().collect<T>()

      return res
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), queryRef],
    },
  )
}

// #endregion useSurrealQuery

// #region useSurrealRun

export async function useSurrealRun<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  name: MaybeRef<string>,
  args?: MaybeRef<unknown[]>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<T>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Jsonify<T>, ErrorT, DefaultT>> {
  const nameRef = toRef(name)
  const argsRef = toRef(args)
  const { key = `surreal:run:${nameRef.value.toString()}:${argsRef.value?.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
      const res = await client.run<T>(nameRef.value, argsRef.value).json()

      return res
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), nameRef, argsRef],
    },
  )
}

// #endregion useSurrealRun

// #region useSurrealSelect

interface _UseSurrealSelectPromise<T, I> {
  /**
   * Configure the query to only select the specified field(s)
   */
  fields(...fields: Field<I>[]): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the query to retrieve the value of the specified field
   */
  value(field: Field<I>): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the query to start at the specified index
   */
  start(start: number): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the query to limit the number of results
   */
  limit(limit: number): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the query to fetch only records that match the condition.
   *
   * Expressions can be imported from the `surrealdb` package and combined
   * to compose the desired condition.
   *
   * @see {@link https://github.com/surrealdb/surrealdb.js/blob/main/packages/sdk/src/utils/expr.ts}
   */
  where(expr: ExprLike): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the query to fetch record link contents for the specified field(s)
   */
  fetch(...fields: Field<I>[]): _UseSurrealSelectPromise<T, I>
  /**
   * Configure the timeout of the query
   */
  timeout(timeout: Duration): _UseSurrealSelectPromise<T, I>
  /**
   * Configure a custom version of the data being created. This is used
   * alongside version enabled storage engines such as SurrealKV.
   */
  version(version: DateTime): _UseSurrealSelectPromise<T, I>
}

export type UseSurrealSelectPromise<T, I> = (select: _UseSurrealSelectPromise<T, I>) => _UseSurrealSelectPromise<T, I>

export async function useSurrealSelect<
  T extends Doc,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: RecordId,
  select?: UseSurrealSelectPromise<RecordResult<T>, T>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<RecordResult<T>>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T>>, ErrorT, DefaultT>>
export async function useSurrealSelect<
  T extends Doc,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: Table | RecordIdRange,
  select?: UseSurrealSelectPromise<RecordResult<T>[], T>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<RecordResult<T>[]>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T>[]>, ErrorT, DefaultT>>
export async function useSurrealSelect<
  T extends Doc,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: RecordId | Table | RecordIdRange,
  select?: UseSurrealSelectPromise<RecordResult<T>, T> | UseSurrealSelectPromise<RecordResult<T>[], T>,
  asyncDataOptions?: _AsyncDataOptions<Jsonify<RecordResult<T>>, DefaultT> & {
    key?: string
  } | _AsyncDataOptions<Jsonify<RecordResult<T>[]>, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T>> | Jsonify<RecordResult<T>[]>, ErrorT, DefaultT>> {
  const { key = `surreal:run:${tableOrRecord.toString()}`, ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
      const _select = client.select<T>(tableOrRecord as any)

      return await (select ? (select(_select) as any) : _select).json()
    },
    {
      ...restOptions,
      watch: [...(restOptions?.watch || []), () => tableOrRecord],
    } as any,
  )
}

// #endregion useSurrealSelect

// #region useSurrealVersion

export async function useSurrealVersion<
  ErrorT,
  DefaultT = undefined,
>(
  asyncDataOptions?: _AsyncDataOptions<VersionInfo, DefaultT> & {
    key?: string
  },
): Promise<UseSurrealAsyncData<VersionInfo, ErrorT, DefaultT>> {
  const { key = 'surreal:version', ...restOptions } = asyncDataOptions || {}

  return useSurrealAsyncData(
    key,
    async (client) => {
      const res = await client.version()

      return res
    },
    restOptions,
  )
}

// #endregion useSurrealVersion
