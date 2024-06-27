import type { PublicRuntimeConfig } from 'nuxt/schema'
import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'

import type {
  KeysOf,
  PickFrom,
  Overrides,
  RpcMethods,
  RpcParams,
  RpcRequest,
  RpcResponseError,
  UseSurrealRpcOptions,
} from '../types'

import type { MaybeRefOrGetter } from '#imports'
import {
  computed,
  createError,
  toValue,
  useNuxtApp,
  useSurrealFetch,
  useSurrealRPC,
} from '#imports'

type MROGParam<T, M extends keyof RpcMethods<T>, N extends number> = MaybeRefOrGetter<RpcParams<T, M>[N]>

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealFetchOptionsOverride, $surrealRPC } = useNuxtApp()

  // authenticate [ token ]
  async function $authenticate(
    token: MROGParam<any, 'authenticate', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<any>({
      method: 'authenticate', params: [toValue(token)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function authenticate(
    token: MROGParam<any, 'authenticate', 0>,
    options?: UseSurrealRpcOptions<any>,
  ): Promise<AsyncData<any | null, RpcResponseError | FetchError<any> | null>> {
    const { database, key, immediate, token: tokenOvr, watch, ...opts } = options || {}

    const params = computed<RpcRequest<any, 'authenticate'>['params']>(() => ([toValue(token)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'authenticate', toValue(params)])

    return useSurrealRPC<any>({ method: 'authenticate', params }, {
      ...opts,
      database: database || overrides?.database,
      token: tokenOvr || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // create [ thing, data? ]
  async function $create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    data?: MROGParam<T, 'create', 1>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'create', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    data?: MROGParam<T, 'create', 1>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'create'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'create', toValue(params)])

    return useSurrealRPC<T>({ method: 'create', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // info
  async function $info<T = any>(
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'info',
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function info<T = any>(
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, key, token, ...opts } = options || {}

    const _key = key ?? 'Sur_' + hash(['surreal', 'info'])

    return useSurrealRPC<T>({ method: 'info' }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      key: _key,
    })
  }

  // insert [ thing, data? ]
  async function $insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    data?: MROGParam<T, 'insert', 1>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'insert', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    data?: MROGParam<T, 'insert', 1>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'insert'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'insert', toValue(params)])

    return useSurrealRPC<T>({ method: 'insert', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // invalidate
  async function $invalidate(
    options?: Overrides,
  ) {
    return $surrealRPC<any>({
      method: 'invalidate',
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function invalidate(
    options?: UseSurrealRpcOptions<any>,
  ): Promise<AsyncData<any, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const _key = key ?? 'Sur_' + hash(['surreal', 'invalidate'])

    return useSurrealRPC<any>({ method: 'invalidate' }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // merge [ thing, data ]
  async function $merge<T = any>(
    thing: MROGParam<T, 'merge', 0>,
    data: MROGParam<T, 'merge', 1>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'merge', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function merge<T = any>(
    thing: MROGParam<T, 'merge', 0>,
    data: MROGParam<T, 'merge', 1>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'merge'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'merge', toValue(params)])

    return useSurrealRPC<T>({ method: 'merge', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // patch [ thing, patches, diff? ]
  async function $patch<T = any>(
    thing: MROGParam<T, 'patch', 0>,
    patches: MROGParam<T, 'patch', 1>,
    diff?: MROGParam<T, 'patch', 2>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'patch', params: [toValue(thing), toValue(patches), toValue(diff)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function patch<T = any>(
    thing: MROGParam<T, 'patch', 0>,
    patches: MROGParam<T, 'patch', 1>,
    diff?: MROGParam<T, 'patch', 2>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'patch'>['params']>(() => ([toValue(thing), toValue(patches), toValue(diff)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'patch', toValue(params)])

    return useSurrealRPC<T>({ method: 'patch', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // query [ sql, vars? ]
  async function $query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    vars?: MROGParam<T, 'query', 1>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'query', params: [toValue(sql), toValue(vars)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    vars?: MROGParam<T, 'query', 1>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'query'>['params']>(() => ([toValue(sql), toValue(vars)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<T>({ method: 'query', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      key: _key,
      watch: watch === false ? [] : [params, ...(watch || [])],
    })
  }

  // remove [ thing ] (`delete` is a reserved word in JS)
  async function $remove(
    thing: MROGParam<any, 'delete', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<any>({
      method: 'delete', params: [toValue(thing)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function remove(
    thing: MROGParam<any, 'delete', 0>,
    options?: UseSurrealRpcOptions<any>,
  ): Promise<AsyncData<any, FetchError<any> | RpcResponseError | null>> {
    const { database, key, immediate, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<any, 'delete'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'delete', toValue(params)])

    return useSurrealRPC<any>({ method: 'delete', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      key: _key,
      immediate: immediate === undefined ? false : immediate,
      watch: watch === undefined ? false : watch,
    })
  }

  // select [ thing ]
  async function $select<T = any>(
    thing: MROGParam<T, 'select', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'select', params: [toValue(thing)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function select<T = any>(
    thing: MROGParam<T, 'select', 0>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'select'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<T>({ method: 'select', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      key: _key,
      watch: watch === false ? [] : [params, ...(watch || [])],
    })
  }

  // signin [ ... ]
  async function $signin(
    auth: MROGParam<any, 'signin', 0>,
    options?: Overrides,
  ) {
    return $surrealRPC<string | null>({
      method: 'signin', params: [toValue(auth)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function signin(
    auth: MROGParam<any, 'signin', 0>,
    options?: UseSurrealRpcOptions<string | null>,
  ): Promise<AsyncData<PickFrom<string | null, KeysOf<string | null>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<any, 'signin'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signin', toValue(params)])

    return useSurrealRPC<string | null>({ method: 'signin', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // signup [ NS, DB, SC, ... ]
  async function $signup<T = any>(
    auth: MROGParam<any, 'signup', 0>,
    options?: {
      database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | { host?: string }
    },
  ) {
    const { NS, DB, SC } = toValue(auth)
    if (!NS) throw createError({ statusCode: 500, message: 'Missing NS param' })
    if (!DB) throw createError({ statusCode: 500, message: 'Missing DB param' })
    if (!SC) throw createError({ statusCode: 500, message: 'Missing SC param' })
    const { baseURL } = $surrealFetchOptionsOverride(options || overrides)
    return $surrealRPC<T>({
      method: 'signup', params: [toValue(auth)],
    }, {
      database: {
        host: baseURL,
        NS,
        DB,
        SC,
      },
    })
  }
  async function signup<T = any>(
    auth: MROGParam<any, 'signup', 0>,
    options?: Omit<UseSurrealRpcOptions<T>, 'database'> & {
      database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | { host?: string }
    },
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { NS, DB, SC } = toValue(auth)
    if (!NS) throw createError({ statusCode: 500, message: 'Missing NS param' })
    if (!DB) throw createError({ statusCode: 500, message: 'Missing DB param' })
    if (!SC) throw createError({ statusCode: 500, message: 'Missing SC param' })
    const { database, immediate, key, token, watch, ...opts } = options || {}
    const { baseURL } = $surrealFetchOptionsOverride({ database: database || overrides?.database })

    const params = computed<RpcRequest<any, 'signup'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signup', toValue(params)])

    return useSurrealRPC<T>({ method: 'signup', params }, {
      ...opts,
      database: {
        host: baseURL,
        NS,
        DB,
        SC,
      },
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // update [ thing, data? ]
  async function $update<T = any>(
    thing: MROGParam<T, 'update', 0>,
    data?: MROGParam<T, 'update', 1>,
    options?: Overrides,
  ) {
    return $surrealRPC<T>({
      method: 'update', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function update<T = any>(
    thing: MROGParam<T, 'update', 0>,
    data?: MROGParam<T, 'update', 1>,
    options?: UseSurrealRpcOptions<T>,
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | null, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<T, 'update'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'update', toValue(params)])

    return useSurrealRPC<T>({ method: 'update', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  async function $version(options?: Overrides) {
    return $surrealFetch('version', {
      ...$surrealFetchOptionsOverride({
        database: options?.database || overrides?.database,
        token: options?.token || overrides?.token,
      }),
    })
  }
  async function version(options?: Overrides): Promise<AsyncData<any, FetchError<any> | null>> {
    return useSurrealFetch('version', {
      ...$surrealFetchOptionsOverride({
        database: options?.database || overrides?.database,
        token: options?.token || overrides?.token,
      }),
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
    $surrealFetch,
    $surrealRPC,
  }
}
