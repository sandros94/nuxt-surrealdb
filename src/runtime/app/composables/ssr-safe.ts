import type {
  Surreal,
  RecordResult,
  Jsonify,
  AnyRecordId,
  RecordIdRange,
  Table,
  Duration,
  DateTime,
  ExprLike,
  VersionInfo,
  SqlExportOptions,
} from 'surrealdb'

import type {
  AsyncData,
  AsyncDataOptions,
  KeysOf,
  PickFrom,
} from '#app/composables/asyncData'
import type { NuxtError } from '#app'
import { type MaybeRefOrGetter, toRef, toValue, useAsyncData, useSurreal } from '#imports'

import type { MaybePromise } from '../../types'

// Surreal types

type Field<I> = keyof I | (string & {})
type Collect<T extends unknown[]> = T extends []
  ? unknown[]
  : {
      [K in keyof T]: Jsonify<T[K]>;
    }

// AsyncData types

export type SurrealAsyncData<DataT, ErrorT> = AsyncData<DataT, ErrorT>
export type SurrealAsyncDataOptions<T, DefaultT> = AsyncDataOptions<T, T, KeysOf<T>, DefaultT>
export type UseSurrealAsyncData<T, ErrorT, DefaultT> = SurrealAsyncData<PickFrom<T, KeysOf<T>> | DefaultT, (ErrorT extends Error | NuxtError ? ErrorT : NuxtError<ErrorT>) | undefined>

// #region useSurrealAsyncData

/**
 * SSR-safe composable for executing arbitrary SurrealDB operations.
 *
 * @param cb - Callback receiving the connected {@link Surreal} client
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data } = await useSurrealAsyncData((client) => {
 *   return client.select(new Table('users')).json()
 * })
 * ```
 */
export async function useSurrealAsyncData<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  cb: (client: Surreal) => MaybePromise<T>,
  asyncDataOptions?: SurrealAsyncDataOptions<T, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<T, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }

  const {
    data,
    error,
    pending,
    status,
    execute,
    refresh,
    clear,
  } = await useAsyncData<T, ErrorT, T, KeysOf<T>, DefaultT>(
    _key!,
    async () => {
      const client = await useSurreal()
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

/**
 * Returns the record of the currently authenticated user.
 * Selects the `$auth` parameter from SurrealDB.
 *
 * Make sure the user has permission to select their own record,
 * otherwise an empty result is returned.
 *
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data: user } = await useSurrealAuth<{ name: string }>()
 * ```
 */
export async function useSurrealAuth<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  asyncDataOptions?: SurrealAsyncDataOptions<Jsonify<RecordResult<T> | undefined>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T> | undefined>, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }

  return useSurrealAsyncData<Jsonify<RecordResult<T> | undefined>, ErrorT, DefaultT>(
    async (client) => {
      return await client.auth<T>().json()
    },
    asyncDataOptions,
    _key,
  )
}

// #endregion useSurrealAuth

// #region useSurrealExport

/**
 * Export the database as a SurrealQL string.
 *
 * @param expOptions - Export options (reactive)
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data: dump } = await useSurrealExport()
 * ```
 */
export async function useSurrealExport<
  ErrorT,
  DefaultT = undefined,
>(
  expOptions?: MaybeRefOrGetter<Partial<SqlExportOptions>>,
  asyncDataOptions?: SurrealAsyncDataOptions<string, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<string, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof expOptions === 'string') {
    _key = expOptions
    expOptions = undefined
  }
  else if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }

  const expOptionsRef = toRef(expOptions)

  return useSurrealAsyncData(
    async (client) => {
      return await client.export(expOptionsRef.value)
    },
    {
      ...asyncDataOptions,
      watch: [...(asyncDataOptions?.watch || []), expOptionsRef],
    },
    _key,
  )
}

// #endregion useSurrealExport

// #region useSurrealImport

/**
 * Import SurrealQL data into the database.
 *
 * @param input - The SurrealQL string to import (reactive)
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data: ok } = await useSurrealImport('DEFINE TABLE users;')
 * ```
 */
export async function useSurrealImport<
  ErrorT,
  DefaultT = undefined,
>(
  input: MaybeRefOrGetter<string>,
  asyncDataOptions?: SurrealAsyncDataOptions<true, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<true, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }

  const inputRef = toRef(input)

  return useSurrealAsyncData(
    async (client) => {
      await client.import(inputRef.value)
      return true as const
    },
    {
      ...asyncDataOptions,
      watch: [...(asyncDataOptions?.watch || []), inputRef],
    },
    _key,
  )
}

// #endregion useSurrealImport

// #region useSurrealQuery

/**
 * Run a set of SurrealQL statements against the database.
 * Results are automatically JSON-serialized for SSR payload transfer.
 *
 * @param query - The SurrealQL query string (reactive)
 * @param bindings - Optional query variable bindings (reactive)
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data } = await useSurrealQuery<[User[]]>(
 *   'SELECT * FROM users WHERE age > $min',
 *   { min: 18 },
 * )
 * ```
 */
export async function useSurrealQuery<
  T extends unknown[],
  ErrorT,
  DefaultT = undefined,
>(
  query: MaybeRefOrGetter<string>,
  bindings?: MaybeRefOrGetter<Record<string, MaybeRefOrGetter<unknown>>>,
  asyncDataOptions?: SurrealAsyncDataOptions<Collect<T>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Collect<T>, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }
  else if (typeof bindings === 'string') {
    _key = bindings
    bindings = undefined
  }

  const queryRef = toRef(query)
  const bindingsRef = toRef(bindings)

  return useSurrealAsyncData(
    async (client) => {
      return await client.query<T>(queryRef.value, bindingsRef.value).json().collect<T>()
    },
    {
      ...asyncDataOptions,
      watch: [...(asyncDataOptions?.watch || []), queryRef],
    },
    _key,
  )
}

// #endregion useSurrealQuery

// #region useSurrealRun

/**
 * Run a SurrealQL function and return the result.
 *
 * @param name - The full name of the function to run (reactive)
 * @param args - Arguments supplied to the function (reactive)
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data } = await useSurrealRun<number>('fn::get_count', ['users'])
 * ```
 */
export async function useSurrealRun<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  name: MaybeRefOrGetter<string>,
  args?: MaybeRefOrGetter<unknown[]>,
  asyncDataOptions?: SurrealAsyncDataOptions<Jsonify<T>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Jsonify<T>, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }
  else if (typeof args === 'string') {
    _key = args
    args = undefined
  }

  const nameRef = toRef(name)
  const argsRef = toRef(args)

  return useSurrealAsyncData(
    async (client) => {
      return await client.run<T>(nameRef.value, argsRef.value).json()
    },
    {
      ...asyncDataOptions,
      watch: [...(asyncDataOptions?.watch || []), nameRef, argsRef],
    },
    _key,
  )
}

// #endregion useSurrealRun

// #region useSurrealSelect

/**
 * Structural interface matching the upstream `SelectPromise`'s chainable API.
 * Since `SelectPromise` is not exported from `surrealdb`, this provides
 * equivalent type support through structural compatibility.
 */
export interface SurrealSelectBuilder<T, I> {
  /**
   * Configure the query to return the result as a
   * JSON-compatible structure.
   *
   * @remarks Called internally by the composable — you do not need to call this yourself.
   */
  json(): PromiseLike<Jsonify<T>>
  /**
   * Configure the query to only select the specified field(s)
   */
  fields(...fields: Field<I>[]): SurrealSelectBuilder<T, I>
  /**
   * Configure the query to retrieve the value of the specified field
   */
  value(field: Field<I>): SurrealSelectBuilder<T, I>
  /**
   * Configure the query to start at the specified index
   */
  start(start: number): SurrealSelectBuilder<T, I>
  /**
   * Configure the query to limit the number of results
   */
  limit(limit: number): SurrealSelectBuilder<T, I>
  /**
   * Configure the query to fetch only records that match the condition.
   *
   * Expressions can be imported from the `surrealdb` package and combined
   * to compose the desired condition.
   *
   * @see {@link https://github.com/surrealdb/surrealdb.js/blob/main/packages/sdk/src/utils/expr.ts}
   */
  where(expr: ExprLike): SurrealSelectBuilder<T, I>
  /**
   * Configure the query to fetch record link contents for the specified field(s)
   */
  fetch(...fields: Field<I>[]): SurrealSelectBuilder<T, I>
  /**
   * Configure the timeout of the query
   */
  timeout(timeout: Duration): SurrealSelectBuilder<T, I>
  /**
   * Configure a custom version of the data being created. This is used
   * alongside version enabled storage engines such as SurrealKV.
   */
  version(version: DateTime): SurrealSelectBuilder<T, I>
}

export type UseSurrealSelectPromise<T, I> = (builder: SurrealSelectBuilder<T, I>) => SurrealSelectBuilder<T, I>

/**
 * Select records from a table, record ID, or record ID range.
 * Accepts a chainable builder callback for filtering, pagination, and field selection.
 * Results are automatically JSON-serialized. The first argument supports reactive inputs.
 *
 * @param tableOrRecord - The table, record ID, or range to select from (reactive)
 * @param select - Optional callback to configure the select query via the builder API
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * // Select all records from a table
 * const { data } = await useSurrealSelect(new Table('users'))
 *
 * // With filtering and pagination
 * const { data } = await useSurrealSelect(
 *   new Table('users'),
 *   q => q.where(eq('active', true)).limit(10).start(0),
 * )
 *
 * // Select a single record
 * const id = ref<string>('tobie')
 * const { data } = await useSurrealSelect(() => new RecordId('users', id.value))
 * ```
 */
export async function useSurrealSelect<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: MaybeRefOrGetter<AnyRecordId>,
  select?: UseSurrealSelectPromise<RecordResult<T> | undefined, T>,
  asyncDataOptions?: SurrealAsyncDataOptions<Jsonify<RecordResult<T> | undefined>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T> | undefined>, ErrorT, DefaultT>>
export async function useSurrealSelect<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: MaybeRefOrGetter<Table | RecordIdRange>,
  select?: UseSurrealSelectPromise<RecordResult<T>[], T>,
  asyncDataOptions?: SurrealAsyncDataOptions<Jsonify<RecordResult<T>[]>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T>[]>, ErrorT, DefaultT>>
export async function useSurrealSelect<
  T,
  ErrorT,
  DefaultT = undefined,
>(
  tableOrRecord: MaybeRefOrGetter<AnyRecordId | Table | RecordIdRange>,
  select?: UseSurrealSelectPromise<RecordResult<T> | undefined, T> | UseSurrealSelectPromise<RecordResult<T>[], T>,
  asyncDataOptions?: SurrealAsyncDataOptions<Jsonify<RecordResult<T> | undefined>, DefaultT>
    | SurrealAsyncDataOptions<Jsonify<RecordResult<T>[]>, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<Jsonify<RecordResult<T> | undefined> | Jsonify<RecordResult<T>[]>, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }
  else if (typeof select === 'string') {
    _key = select
    select = undefined
  }

  type Data = RecordResult<T> | RecordResult<T>[] | undefined
  type Options = SurrealAsyncDataOptions<Jsonify<Data>, DefaultT>

  return useSurrealAsyncData(
    async (client) => {
      const builder = client.select<T>(toValue(tableOrRecord) as Table) as SurrealSelectBuilder<Data, T>
      const configured = select
        ? (select as UseSurrealSelectPromise<Data, T>)(builder)
        : builder
      return await configured.json()
    },
    {
      ...(asyncDataOptions as Options),
      watch: [...((asyncDataOptions as Options)?.watch || []), toRef(tableOrRecord)],
    } as Options,
    _key,
  )
}

// #endregion useSurrealSelect

// #region useSurrealVersion

/**
 * Returns the version information of the connected SurrealDB server.
 *
 * @param asyncDataOptions - Options passed to `useAsyncData`
 *
 * @example
 * ```ts
 * const { data: version } = await useSurrealVersion()
 * ```
 */
export async function useSurrealVersion<
  ErrorT,
  DefaultT = undefined,
>(
  asyncDataOptions?: SurrealAsyncDataOptions<VersionInfo, DefaultT>,
  _key?: string,
): Promise<UseSurrealAsyncData<VersionInfo, ErrorT, DefaultT>> {
  // Handle auto-injected key from keyed composables
  if (typeof asyncDataOptions === 'string') {
    _key = asyncDataOptions
    asyncDataOptions = undefined
  }

  return useSurrealAsyncData(
    async (client) => {
      return await client.version()
    },
    asyncDataOptions,
    _key,
  )
}

// #endregion useSurrealVersion
