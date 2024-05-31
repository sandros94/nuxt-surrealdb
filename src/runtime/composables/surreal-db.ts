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

  // authenticate [ token ]
  async function $authenticate<T = any>(
    token: MROGParam<T, 'authenticate', 0>,
    overrides?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'authenticate', params: [toValue(token)] }, overrides)
  }
  async function authenticate<T = any>(
    token: MROGParam<T, 'authenticate', 0>,
    options?: SurrealRpcOptions<T>,
  ) {
    const { key, immediate, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'authenticate'>['params']>(() => ([toValue(token)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'authenticate', toValue(params)])

    return useSurrealRPC<T>({ method: 'authenticate', params }, {
      ...opts,
      key: _key,
      immediate: immediate === undefined ? false : immediate,
      watch: watch === undefined ? false : watch,
    })
  }

  // create [ thing, data ]
  async function $create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    options?: Overrides & { data?: MROGParam<T, 'create', 1> },
  ) {
    const { data, ...ovr } = options || {}
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
      watch: watch === undefined ? false : watch,
    })
  }

  // info
  async function $info<T = any>(
    overrides?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'info', params: [] }, overrides)
  }
  async function info<T = any>(
    options?: SurrealRpcOptions<T>,
  ) {
    const { key, ...opts } = options || {}

    const _key = key ?? 'Sur_' + hash(['surreal', 'info'])

    return useSurrealRPC<T>({ method: 'info', params: [] }, {
      ...opts,
      key: _key,
    })
  }

  // insert [ thing, data ]
  async function $insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    options?: Overrides & { data?: MROGParam<T, 'insert', 1> },
  ) {
    const { data, ...ovr } = options || {}
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
      watch: watch === undefined ? false : watch,
    })
  }

  // invalidate
  async function $invalidate<T = any>(
    overrides?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'invalidate', params: [] }, overrides)
  }
  async function invalidate<T = any>(
    options?: SurrealRpcOptions<T>,
  ) {
    const { immediate, key, watch, ...opts } = options || {}

    const _key = key ?? 'Sur_' + hash(['surreal', 'invalidate'])

    return useSurrealRPC<T>({ method: 'invalidate', params: [] }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // merge [ thing, data ]
  async function $merge<T = any>(
    thing: MROGParam<T, 'merge', 0>,
    options: Overrides & { data: MROGParam<T, 'merge', 1> },
  ) {
    const { data, ...ovr } = options
    return $surrealRPC<T>({ method: 'merge', params: [toValue(thing), toValue(data)] }, ovr)
  }
  async function merge<T = any>(
    thing: MROGParam<T, 'merge', 0>,
    options: SurrealRpcOptions<T> & { data: MROGParam<T, 'merge', 1> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { data, immediate, key, watch, ...opts } = options

    const params = computed<RpcRequest<T, 'merge'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'merge', toValue(params)])

    return useSurrealRPC<T>({ method: 'merge', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // patch [ thing, patches, diff ]
  async function $patch<T = any>(
    thing: MROGParam<T, 'patch', 0>,
    options: Overrides & { patches: MROGParam<T, 'patch', 1>, diff?: MROGParam<T, 'patch', 2> },
  ) {
    const { diff, patches, ...ovr } = options
    return $surrealRPC<T>({ method: 'patch', params: [toValue(thing), toValue(patches), toValue(diff)] }, ovr)
  }
  async function patch<T = any>(
    thing: MROGParam<T, 'patch', 0>,
    options: SurrealRpcOptions<T> & { patches: MROGParam<T, 'patch', 1>, diff?: MROGParam<T, 'patch', 2> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { diff, immediate, key, patches, watch, ...opts } = options

    const params = computed<RpcRequest<T, 'patch'>['params']>(() => ([toValue(thing), toValue(patches), toValue(diff)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'patch', toValue(params)])

    return useSurrealRPC<T>({ method: 'patch', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // query [ sql, vars ]
  async function $query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    options?: Overrides & { vars?: MROGParam<T, 'query', 1> },
  ) {
    const { vars, ...ovr } = options || {}
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
    overrides?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'delete', params: [toValue(thing)] }, overrides)
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
      watch: watch === undefined ? false : watch,
    })
  }

  // select [ thing ]
  async function $select<T = any>(
    thing: MROGParam<T, 'select', 0>,
    overrides?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'select', params: [toValue(thing)] }, overrides)
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

  // signin [ ... ]
  async function $signin<T = any>(
    auth: MROGParam<T, 'signin', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'signin', params: [toValue(auth)] }, options)
  }
  async function signin<T = any>(
    auth: MROGParam<T, 'signin', 0>,
    options?: SurrealRpcOptions<T>,
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { immediate, key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'signin'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signin', toValue(params)])

    return useSurrealRPC<T>({ method: 'signin', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // signup [ NS, DB, SC, ... ]
  async function $signup<T = any>(
    auth: MROGParam<T, 'signup', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({ method: 'signup', params: [toValue(auth)] }, options)
  }
  async function signup<T = any>(
    auth: MROGParam<T, 'signup', 0>,
    options?: SurrealRpcOptions<T>,
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { immediate, key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'signup'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signup', toValue(params)])

    return useSurrealRPC<T>({ method: 'signup', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // update [ thing, data ]
  async function $update<T = any>(
    thing: MROGParam<T, 'update', 0>,
    options?: Overrides & { data?: MROGParam<T, 'update', 1> },
  ) {
    const { data, ...ovr } = options || {}
    return $surrealRPC<T>({ method: 'update', params: [toValue(thing), toValue(data)] }, ovr)
  }
  async function update<T = any>(
    thing: MROGParam<T, 'update', 0>,
    options?: SurrealRpcOptions<T> & { data?: MROGParam<T, 'update', 1> },
  ): Promise<AsyncData<RpcResponse<T> | null, FetchError<any> | null>> {
    const { data, immediate, key, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'update'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'update', toValue(params)])

    return useSurrealRPC<T>({ method: 'update', params }, {
      ...opts,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
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
    $authenticate,
    authenticate,
    $create,
    create,
    $info,
    info,
    $insert,
    insert,
    $invalidate,
    invalidate,
    $merge,
    merge,
    $patch,
    patch,
    $query,
    query,
    $remove,
    remove,
    $select,
    select,
    $signin,
    signin,
    $signup,
    signup,
    $sql: $query,
    sql: query,
    $update,
    update,
    $version,
    version,
  }
}
