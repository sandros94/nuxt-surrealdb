import { joinURL } from 'ufo'
import { hash } from 'ohash'

import type { Overrides } from '../types'
import type { AsyncDataOptions } from '#app'
import type { MaybeRefOrGetter } from '#imports'
import { computed, createError, toValue, useAsyncData, useNuxtApp, useSurrealFetch } from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()

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
  ) {
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
      return key ?? 'D_' + hash(['surrealItems', toValue(_table), toValue(id || '')])
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

  async function sql<T = any>(sql: string, ovr?: Overrides) {
    return useSurrealFetch<T>('sql', {
      ...(ovr || overrides),
      method: 'POST',
      body: sql,
    })
  }

  async function $sql<T = any>(sql: string, ovr?: Overrides) {
    return $surrealFetch<T>('sql', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
      method: 'POST',
      body: sql,
    })
  }

  async function version(ovr?: Overrides) {
    return useSurrealFetch('version', {
      ...$surrealFetchOptionsOverride(ovr || overrides),
    })
  }

  return {
    items,
    sql,
    $sql,
    version,
  }
}
