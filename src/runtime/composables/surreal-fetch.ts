import type { AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { hash } from 'ohash'

import type {
  KeysOf,
  PickFrom,
  UseSurrealFetchOptions,
  UseSurrealRpcOptions,
  RpcRequest,
  RpcResponseError,
  HttpResponseError,
} from '#surrealdb/types/index'
import {
  surrealFetchOptionsOverride,
} from '#surrealdb/utils/overrides'
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
  useSurrealPreset,
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
  const { $surrealFetch } = useNuxtApp()
  const _database = useSurrealPreset({ database, token })
  const { baseURL, headers } = surrealFetchOptionsOverride(_database, opts.headers)

  return useFetch(endpoint, {
    ...opts,
    baseURL,
    headers,
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
