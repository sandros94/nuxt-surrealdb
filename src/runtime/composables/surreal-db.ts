import type { AsyncDataOptions, AsyncData, NuxtError } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { joinURL } from 'ufo'
import { hash } from 'ohash'

import type {
  Overrides,
  PickFrom,
  KeysOf,
  RpcRequest,
  RpcResponse,
  SurrealAsyncDataOptions,
} from '../types'

import type { MaybeRefOrGetter } from '#imports'
import {
  computed,
  createError,
  toValue,
  useAsyncData,
  useNuxtApp,
  useSurrealFetch,
  useSurrealRPC,
} from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride, $surrealRPC } = useNuxtApp()

  // TODO: GET /export Exports all data for a specific Namespace and Database
  // TODO: POST /import Imports data into a specific Namespace and Database

  async function items<T = any>(
    record: MaybeRefOrGetter<string> | {
      table: MaybeRefOrGetter<string>
      id?: MaybeRefOrGetter<string>
    },
    options: AsyncDataOptions<T> & Overrides & {
      key?: string
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: RequestInit['body'] | Record<string, any>
    } = {
      ...overrides,
      method: 'GET',
      key: undefined,
    },
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, NuxtError<unknown> | null>> {
    const _record = toValue(record)
    const {
      key,
      method,
      body,
      database,
      token,
      ...opts
    } = options
    const { id, table } = typeof _record === 'string'
      ? { table: _record.split(':')[0], id: _record.split(':')[1] }
      : _record
    const _table = toValue(table)
    const _key = computed(() => {
      return key ?? 'Sur_' + hash(['surrealItems', toValue(_table), toValue(id || '')])
    })

    return useAsyncData<T>(_key.value, () => {
      const endpoint = computed(() => joinURL('key', _table, toValue(id || '')))

      if (!_table) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Table name is required',
        })
      }
      if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && !body) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Body is required for POST, PUT, and PATCH methods',
        })
      }

      return $surrealFetch<T>(endpoint.value, {
        ...$surrealFetchOptionsOverride({
          database,
          token,
        }),
        method,
        body,
      })
    }, opts)
  }

  // TODO: POST /ml/import Import a SurrealML model into a specific Namespace and Database
  // TODO: GET /ml/export/:name/:version

  // TODO: POST /signup Signs-up as a scope user to a specific scope
  // TODO: POST /signin Signs-in as a root, namespace, database, or scope user

  async function $sql<T = any>(
    sql: RpcRequest<T, 'query'>['params'][0],
    opts?: Overrides & { vars: RpcRequest<T, 'query'>['params'][1] },
  ) {
    const { vars, ...ovr } = opts || {}
    return $surrealRPC<T>({ method: 'query', params: [sql, vars] }, ovr)
  }

  async function sql<T = any>(
    sql: RpcRequest<T, 'query'>['params'][0],
    options?: SurrealAsyncDataOptions<RpcResponse<T>> & { vars: RpcRequest<T, 'query'>['params'][1] },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { vars, ...opts } = options || {}
    return useSurrealRPC<T>({ method: 'query', params: [sql, vars] }, opts)
  }

  async function $version(ovr?: Overrides) {
    return $surrealFetch('version', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
    })
  }
  async function version(ovr?: Overrides): Promise<AsyncData<any, FetchError<any> | null>> {
    return useSurrealFetch('version', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
    })
  }

  return {
    items,
    $query: $sql,
    query: sql,
    $sql,
    sql,
    $version,
    version,
  }
}
