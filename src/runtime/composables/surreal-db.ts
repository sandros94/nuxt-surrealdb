import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'

import type {
  Overrides,
  RpcRequest,
  RpcResponse,
  SurrealRpcOptions,
} from '../types'

import type { MaybeRefOrGetter } from '#imports'
import {
  computed,
  toValue,
  useNuxtApp,
  useSurrealFetch,
  useSurrealRPC,
} from '#imports'

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride, $surrealRPC } = useNuxtApp()

  // TODO: authenticate [ token ]
  // TODO: create [ thing, data ]
  // TODO: delete [ thing ]
  // TODO: info
  // TODO: insert [ thing, data ]
  // TODO: invalidate
  // TODO: merge [ thing, data ]
  // TODO: patch [ thing, patches, diff ]

  async function $query<T = any>(
    sql: RpcRequest<T, 'query'>['params'][0],
    opts?: Overrides & { vars: RpcRequest<T, 'query'>['params'][1] },
  ) {
    const { vars, ...ovr } = opts || {}
    return $surrealRPC<T>({ method: 'query', params: [sql, vars] }, ovr)
  }
  async function query<T = any>(
    sql: RpcRequest<T, 'query'>['params'][0],
    options?: SurrealRpcOptions<T> & { vars: RpcRequest<T, 'query'>['params'][1] },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { vars, ...opts } = options || {}
    return useSurrealRPC<T>({ method: 'query', params: [sql, vars] }, opts)
  }

  async function $select<T = any>(
    thing: RpcRequest<T, 'select'>['params'][0],
    ovr?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'select', params: [thing] }, ovr)
  }
  async function select<T = any>(
    thing: MaybeRefOrGetter<RpcRequest<T, 'select'>['params'][0]>,
    options?: SurrealRpcOptions<T>,
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const params = computed(() => ([toValue(thing)]))
    // @ts-expect-error TODO: better RPC type inference
    return useSurrealRPC<T>({ method: 'select', params }, options)
  }

  // TODO: signin [ ... ]
  // TODO: signup [ NS, DB, SC, ... ]
  // TODO: update [ thing, data ]
  // TODO: use [ ns, db ]

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
    $query,
    query,
    $select,
    select,
    $sql: $query,
    sql: query,
    $version,
    version,
  }
}
