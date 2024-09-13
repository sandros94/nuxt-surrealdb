import type { PublicRuntimeConfig } from '@nuxt/schema'
import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'

import type {
  KeysOf,
  PickFrom,
  Overrides,
  QueryResponse,
  RpcMethods,
  RpcParams,
  RpcRequest,
  RpcResponseError,
  UseSurrealRpcOptions,
} from '#surrealdb/types/index'
import {
  surrealFetchOptionsOverride,
} from '#surrealdb/utils/overrides'

import type { MaybeRefOrGetter } from '#imports'
import {
  computed,
  createError,
  toValue,
  useNuxtApp,
  useSurrealFetch,
  useSurrealPreset,
  useSurrealRPC,
} from '#imports'

type MROGParam<T, M extends keyof RpcMethods<T>, N extends number> = MaybeRefOrGetter<RpcParams<T, M>[N]>

export function useSurrealDB(overrides?: Overrides) {
  const { $surrealFetch, $surrealRPC } = useNuxtApp()

  // authenticate [ token ]
  async function $authenticate(
    token: MROGParam<any, 'authenticate', 0>,
    options?: Overrides,
  ): Promise<void> {
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
  ): Promise<AsyncData<void, RpcResponseError | FetchError<any> | null>> {
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'create', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function create<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<ResT, 'create', 0>,
    data?: MROGParam<ResT, 'create', 1>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<RpcResponseError> | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<ResT, 'create'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'create', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'create', params }, {
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'info',
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function info<
    ResT,
    DataT = ResT,
  >(
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<any> | RpcResponseError | null>> {
    const { database, key, token, ...opts } = options || {}

    const _key = key ?? 'Sur_' + hash(['surreal', 'info'])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'info' }, {
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'insert', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function insert<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<ResT, 'insert', 0>,
    data?: MROGParam<ResT, 'insert', 1>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<ResT, 'insert'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'insert', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'insert', params }, {
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
  ): Promise<void> {
    return $surrealRPC<any>({
      method: 'invalidate',
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function invalidate(
    options?: UseSurrealRpcOptions<any>,
  ): Promise<AsyncData<void, FetchError<any> | RpcResponseError | null>> {
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'merge', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function merge<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<ResT, 'merge', 0>,
    data: MROGParam<ResT, 'merge', 1>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<ResT, 'merge'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'merge', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'merge', params }, {
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
  ): Promise<T> {
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
  ): Promise<AsyncData<PickFrom<T, KeysOf<T>> | undefined, FetchError<any> | RpcResponseError | null>> {
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
  async function $query<T = any, R = QueryResponse<T>>(
    sql: MROGParam<any, 'query', 0>,
    vars?: MROGParam<any, 'query', 1>,
    options?: Overrides,
  ): Promise<R> {
    return $surrealRPC<R>({
      method: 'query', params: [toValue(sql), toValue(vars)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function query<
    ResT extends QueryResponse<any[]> = QueryResponse<any[]>,
    DataT = ResT,
  >(
    sql: MROGParam<any, 'query', 0>,
    vars?: MROGParam<any, 'query', 1>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<RpcResponseError> | null>> {
    const { database, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<any, 'query'>['params']>(() => ([toValue(sql), toValue(vars)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'query', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      key: _key,
      watch: watch === false ? [] : [params, ...(watch || [])],
    })
  }

  // remove [ thing ] (`delete` is a reserved word in JS)
  async function $remove<T = any>(
    thing: MROGParam<any, 'delete', 0>,
    options?: Overrides,
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'delete', params: [toValue(thing)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function remove<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<any, 'delete', 0>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<any> | RpcResponseError | null>> {
    const { database, key, immediate, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<any, 'delete'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'delete', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'delete', params }, {
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'select', params: [toValue(thing)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function select<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<ResT, 'select', 0>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<RpcResponseError> | null>> {
    const { database, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<ResT, 'select'>['params']>(() => ([toValue(thing)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'query', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'select', params }, {
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
    options?: {
      database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | { host?: string }
    },
  ): Promise<string> {
    const { NS, DB, SC, AC } = toValue(auth)
    if (!(SC || AC) && (!toValue(auth).user || !toValue(auth).pass)) throw createError({ statusCode: 400, message: 'Wrong admin credentials' })
    const { host } = useSurrealPreset(options || overrides)
    return $surrealRPC<string>({
      method: 'signin', params: [toValue(auth)],
    }, {
      database: {
        host,
        NS,
        DB,
        SC,
        AC,
      },
    })
  }
  async function signin(
    auth: MROGParam<any, 'signin', 0>,
    options?: UseSurrealRpcOptions<string>,
  ): Promise<AsyncData<string | undefined, RpcResponseError | FetchError<any> | null>> {
    const { NS, DB, SC, AC } = toValue(auth)
    if (!(SC || AC) && (!toValue(auth).user || !toValue(auth).pass)) throw createError({ statusCode: 400, message: 'Wrong admin credentials' })
    const { database, immediate, key, token, watch, ...opts } = options || {}
    const { host } = useSurrealPreset({ database: database || overrides?.database })

    const params = computed<RpcRequest<any, 'signin'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signin', toValue(params)])

    return useSurrealRPC<string>({ method: 'signin', params }, {
      ...opts,
      database: {
        host,
        NS,
        DB,
        SC,
        AC,
      },
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  // signup [ NS, DB, SC, ... ]
  async function $signup(credentials: MROGParam<any, 'signup', 0> & { SC: string, AC?: never }): Promise<string>
  async function $signup(credentials: MROGParam<any, 'signup', 0> & { AC: string, SC?: never }): Promise<string>
  async function $signup(
    auth: MROGParam<any, 'signup', 0> & ({ SC: string, AC?: never } | { AC: string, SC?: never }),
    options?: {
      database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | { host?: string }
    },
  ): Promise<string> {
    const { NS, DB, SC, AC } = toValue(auth)
    if (!NS) throw createError({ statusCode: 400, message: 'Missing NS param' })
    if (!DB) throw createError({ statusCode: 400, message: 'Missing DB param' })
    if (!SC || !AC) throw createError({ statusCode: 400, message: 'Missing SC/AC param' })
    const { host } = useSurrealPreset(options || overrides)
    return $surrealRPC<string>({
      method: 'signup', params: [toValue(auth)],
    }, {
      database: {
        host,
        NS,
        DB,
        SC,
        AC,
      },
    })
  }
  async function signup(
    auth: MROGParam<any, 'signup', 0>,
    options?: Omit<UseSurrealRpcOptions<string>, 'database'> & {
      database?: keyof PublicRuntimeConfig['surrealdb']['databases'] | { host?: string }
    },
  ): Promise<AsyncData<string | undefined, RpcResponseError | FetchError<any> | null>> {
    const { NS, DB, SC, AC } = toValue(auth)
    if (!NS) throw createError({ statusCode: 400, message: 'Missing NS param' })
    if (!DB) throw createError({ statusCode: 400, message: 'Missing DB param' })
    if (!SC || !AC) throw createError({ statusCode: 400, message: 'Missing SC/AC param' })
    const { database, immediate, key, token, watch, ...opts } = options || {}
    const { host } = useSurrealPreset({ database: database || overrides?.database })

    const params = computed<RpcRequest<any, 'signup'>['params']>(() => ([toValue(auth)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'signup', toValue(params)])

    return useSurrealRPC<string>({ method: 'signup', params }, {
      ...opts,
      database: {
        host,
        NS,
        DB,
        SC,
        AC,
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
  ): Promise<T> {
    return $surrealRPC<T>({
      method: 'update', params: [toValue(thing), toValue(data)],
    }, {
      database: options?.database || overrides?.database,
      token: options?.token || overrides?.token,
    })
  }
  async function update<
    ResT,
    DataT = ResT,
  >(
    thing: MROGParam<ResT, 'update', 0>,
    data?: MROGParam<ResT, 'update', 1>,
    options?: UseSurrealRpcOptions<ResT, DataT>,
  ): Promise<AsyncData<PickFrom<DataT, KeysOf<DataT>> | undefined, FetchError<any> | RpcResponseError | null>> {
    const { database, immediate, key, token, watch, ...opts } = options || {}

    const params = computed<RpcRequest<ResT, 'update'>['params']>(() => ([toValue(thing), toValue(data)]))
    const _key = key ?? 'Sur_' + hash(['surreal', 'update', toValue(params)])

    return useSurrealRPC<ResT, RpcResponseError, DataT>({ method: 'update', params }, {
      ...opts,
      database: database || overrides?.database,
      token: token || overrides?.token,
      immediate: immediate === undefined ? false : immediate,
      key: _key,
      watch: watch === undefined ? false : watch,
    })
  }

  async function $version(options?: Overrides): Promise<string> {
    const database = useSurrealPreset(options || overrides)
    return $surrealFetch<string>('version', {
      ...surrealFetchOptionsOverride(database),
    })
  }
  async function version(options?: Overrides): Promise<AsyncData<string | undefined, FetchError<any> | null>> {
    const database = useSurrealPreset(options || overrides)
    return useSurrealFetch<string>('version', {
      ...surrealFetchOptionsOverride(database),
    })
  }

  return {
    $authenticate,
    authenticate,
    $create,
    create,
    $delete: $remove,
    delete: remove,
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
