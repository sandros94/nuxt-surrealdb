import { joinURL } from 'ufo'

import type { Overrides } from '../types'
import type { UseFetchOptions } from '#app'
import type { MaybeRefOrGetter } from '#imports'
import { createError, toValue, useNuxtApp, useSurrealFetch } from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()

  async function items<T = any>(
    record: MaybeRefOrGetter<string> | {
      table: MaybeRefOrGetter<string>
      id?: MaybeRefOrGetter<string>
    },
    options: Omit<UseFetchOptions<T>, 'method'> & Overrides & {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    } = {
      ...overrides,
      method: 'GET',
    },
  ) {
    const _record = toValue(record)
    const {
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

    return useSurrealFetch<T>(() => joinURL('key', _table, toValue(id || '')), {
      ...opts,
      ...$surrealFetchOptionsOverride({
        database,
        token,
      }),
      method,
      body,
    })
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
