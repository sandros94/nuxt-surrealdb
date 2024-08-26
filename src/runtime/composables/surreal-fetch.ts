import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'
import { createDefu, defu } from 'defu'

import type {
  DatabasePresetKeys,
  KeysOf,
  PickFrom,
  UseSurrealFetchOptions,
  UseSurrealRpcOptions,
  RpcRequest,
  RpcResponseError,
  HttpResponseError,
} from '../types/index'
import type {
  ComputedRef,
  MaybeRefOrGetter,
} from '#imports'
import {
  createError,
  ref,
  toValue,
  useFetch,
  useNuxtApp,
  useRuntimeConfig,
} from '#imports'

export function useSurrealFetch<
  ResT,
  ErrorT = HttpResponseError,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  endpoint: MaybeRefOrGetter<string>,
  options: UseSurrealFetchOptions<ResT, DataT, PickKeys, DefaultT> = {},
): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, FetchError<ErrorT> | null> {
  const {
    database,
    token,
    ...opts
  } = options
  const { $surrealFetch, $surrealFetchOptionsOverride } = useNuxtApp()

  const { baseURL, headers } = $surrealFetchOptionsOverride({ database, token })

  return useFetch(endpoint, {
    ...opts,
    ...(baseURL !== undefined && { baseURL }),
    headers: {
      ...opts.headers,
      ...headers,
    },
    $fetch: $surrealFetch,
  })
}

export function useSurrealRPC<
  ResT,
  ErrorT = RpcResponseError,
  DataT = ResT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  DefaultT = undefined,
>(
  req: {
    method: MaybeRefOrGetter<RpcRequest<DataT>['method']>
    params?: MaybeRefOrGetter<RpcRequest<DataT>['params']> | ComputedRef<RpcRequest<DataT>['params']>
  },
  options?: UseSurrealRpcOptions<ResT, DataT, PickKeys, DefaultT>,
) {
  const id = ref(0)
  const { key, ...opts } = options || {}

  const _key = key ?? 'Sur_' + hash(['surreal', 'rpc', toValue(req.method), toValue(req.params)])

  return useSurrealFetch<ResT, ErrorT, DataT, PickKeys, DefaultT>('rpc', {
    ...opts,
    onResponse({ response }) {
      if (response.status === 200 && response._data.error) {
        throw createError({
          statusCode: response._data.error.code,
          message: response._data.error.message,
        })
      }
      else if (response.status === 200) {
        response._data = response._data.result
      }
    },
    method: 'POST',
    body: {
      id: id.value++,
      ...req,
    },
    key: _key,
  })
}

export function useSurrealDatabases() {
  const {
    databases: publicDatabases,
    defaultDatabase,
  } = useRuntimeConfig().public.surrealdb
  const defaultDB = publicDatabases[defaultDatabase as DatabasePresetKeys]

  const defuDatabases = createDefu((obj, key, value) => {
    obj[key] = defu(value, obj[key], defaultDB)
    return true
  })

  const databases = defuDatabases(publicDatabases, {
    [defaultDatabase]: defaultDB,
  })

  return databases
}
