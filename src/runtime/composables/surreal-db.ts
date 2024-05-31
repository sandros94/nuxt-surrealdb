import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'

import type {
  Overrides,
  RpcMethods,
  RpcParams,
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

type MROGParam<T, M extends keyof RpcMethods<T>, N extends number> = MaybeRefOrGetter<RpcParams<T, M>[N]>

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride, $surrealRPC } = useNuxtApp()

  // TODO: authenticate [ token ]

  // create [ thing, data ]
  async function $create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    opts?: Overrides & { data?: MROGParam<T, 'create', 1> },
  ) {
    const { data, ...ovr } = opts || {}
    return $surrealRPC<T>({ method: 'create', params: [toValue(thing), toValue(data)] }, ovr)
  }
  async function create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    options?: SurrealRpcOptions<T> & { data?: MROGParam<T, 'create', 1> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { data, immediate, key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'create'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'create', toValue(params)])

    return useSurrealRPC<T>({ method: 'create', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: false,
    })
  }

  // TODO: info
  // TODO: insert [ thing, data ]
  async function $insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    opts?: Overrides & { data?: MROGParam<T, 'insert', 1> },
  ) {
    const { data, ...ovr } = opts || {}
    return $surrealRPC<T>({ method: 'insert', params: [toValue(thing), toValue(data)] }, ovr)
  }
  async function insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    options?: SurrealRpcOptions<T> & { data?: MROGParam<T, 'insert', 1> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { data, immediate, key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'insert'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'insert', toValue(params)])

    return useSurrealRPC<T>({ method: 'insert', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: false,
    })
  }

  // TODO: invalidate
  // TODO: merge [ thing, data ]
  // TODO: patch [ thing, patches, diff ]

  // query [ sql, vars ]
  async function $query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    opts?: Overrides & { vars?: MROGParam<T, 'query', 1> },
  ) {
    const { vars, ...ovr } = opts || {}
    return $surrealRPC<T>({ method: 'query', params: [toValue(sql), toValue(vars)] }, ovr)
  }
  async function query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    options?: SurrealRpcOptions<T> & { vars?: MROGParam<T, 'query', 1> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { key, vars, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'query'>['params']>(() => ([toValue(sql), toValue(vars)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<T>({ method: 'query', params }, {
      ...opts,
      key: _key,
      watch: watch === false ? [] : [params, ...(watch || [])],
    })
  }

  // remove [ thing ] (`delete` is a js reserved name)
  async function $remove<T = any>(
    thing: MROGParam<T, 'delete', 0>,
    ovr?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'delete', params: [toValue(thing)] }, ovr)
  }
  async function remove<T = any>(
    thing: MROGParam<T, 'delete', 0>,
    options?: SurrealRpcOptions<T>,
  ) {
    const { key, immediate, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'delete'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'delete', toValue(params)])

    return useSurrealRPC<T>({ method: 'delete', params }, {
      ...opts,
      key: _key,
      immediate: immediate === undefined ? false : immediate,
      watch: false,
    })
  }

  // select [ thing ]
  async function $select<T = any>(
    thing: MROGParam<T, 'select', 0>,
    ovr?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'select', params: [toValue(thing)] }, ovr)
  }
  async function select<T = any>(
    thing: MROGParam<T, 'select', 0>,
    options?: SurrealRpcOptions<T>,
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'select'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<T>({ method: 'select', params }, {
      ...opts,
      key: _key,
      watch: watch === false ? [] : [params, ...(watch || [])],
    })
  }

  // TODO: signin [ ... ]
  // TODO: signup [ NS, DB, SC, ... ]
  // TODO: update [ thing, data ]

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
    $create,
    create,
    $insert,
    insert,
    $query,
    query,
    $select,
    select,
    $remove,
    remove,
    $sql: $query,
    sql: query,
    $version,
    version,
  }
}
