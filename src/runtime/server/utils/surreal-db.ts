import type { H3Event } from 'h3'

import type { QueryRpcResponse, RpcParams } from '../../types'
import { type ServerOverrides, useSurrealRPC } from './surreal-fetch'

export function useSurrealDB(event: H3Event, overrides?: ServerOverrides) {
  // query [ sql, vars ]
  async function query<T = any, R = QueryRpcResponse<T>>(
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
