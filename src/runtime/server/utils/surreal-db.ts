import type { H3Event } from 'h3'

import type { QueryResponse, RpcParams, ServerOverrides } from '../../types/index'
import { useSurrealRPC } from './surreal-fetch'

export function useSurrealDB(event: H3Event, overrides?: ServerOverrides) {
  // query [ sql, vars ]
  async function query<T = any, R = QueryResponse<T>>(
    sql: RpcParams<any, 'query'>[0],
    vars?: RpcParams<any, 'query'>[1],
    options?: ServerOverrides,
  ): Promise<R> {
    return useSurrealRPC<R>(event, {
      method: 'query', params: [sql, vars],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }

  return {
    query,
    sql: query,
  }
}
