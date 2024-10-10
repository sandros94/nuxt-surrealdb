import { hash } from 'ohash'

import type {
  KeysOf,
  UseSurrealRpcOptions,
  RpcRequest,
  RpcResponseError,
} from '#surrealdb/types/index'
import type {
  ComputedRef,
  MaybeRefOrGetter,
} from '#imports'
import {
  createError,
  ref,
  toValue,
  useSurrealFetch,
} from '#imports'

export function useSurrealRPC<
  ResT,
  DataT = ResT,
  DefaultT = undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  ErrorT = RpcResponseError,
>(
  req: {
    method: MaybeRefOrGetter<RpcRequest<DataT>['method']>
    params?: MaybeRefOrGetter<RpcRequest<DataT>['params']> | ComputedRef<RpcRequest<DataT>['params']>
  },
  options?: UseSurrealRpcOptions<ResT, DataT, DefaultT, PickKeys>,
) {
  const id = ref(0)
  const { key, ...opts } = options || {}

  const _key = key ?? 'Sur_' + hash(['surreal', 'rpc', toValue(req.method), toValue(req.params)])

  return useSurrealFetch<ResT, DataT, DefaultT, PickKeys, ErrorT>('rpc', {
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
