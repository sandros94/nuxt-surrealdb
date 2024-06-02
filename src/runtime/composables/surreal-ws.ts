import { useWebSocket } from '@vueuse/core'
import { joinURL } from 'ufo'
import { destr } from 'destr'

import type {
  Overrides,
  RpcMethodsWS,
  RpcParamsWS,
  RpcRequestWS,
  RpcResponse,
} from '../types'
import type {
  MaybeRef,
  MaybeRefOrGetter,
} from '#imports'
import {
  computed,
  ref,
  toValue,
  useRuntimeConfig,
  useSurrealAuth,
} from '#imports'

type MROGParam<T, M extends keyof RpcMethodsWS<T>, N extends number> = MaybeRefOrGetter<RpcParamsWS<T, M>[N]>

export function useSurrealWS<T = any>(database?: Overrides['database'], options?: { auth?: MaybeRef<string | null> | false }) {
  const { databases, defaultDatabase, auth: { database: authDatabase } } = useRuntimeConfig().public.surrealdb
  const { token: userAuth } = useSurrealAuth()
  const _database = computed(() => {
    if (database !== undefined) {
      if (typeof database !== 'string' && typeof database !== 'number' && typeof database !== 'symbol') {
        return database
      }
      else {
        return databases[database]
      }
    }
    else {
      return databases[defaultDatabase as keyof typeof databases]
    }
  })
  const idCounter = ref(0)

  const {
    close,
    data: _data,
    open,
    send: _send,
    status,
    ws,
  } = useWebSocket<RpcResponse<T>>(joinURL(_database.value.ws!, 'rpc'), {
    onConnected(ws) {
      ws.send(JSON.stringify({
        id: idCounter.value++,
        method: 'use',
        params: [_database.value.NS, _database.value.DB],
      }))
      if (options?.auth !== false && _database.value === databases[authDatabase as keyof typeof databases]) {
        ws.send(JSON.stringify({
          id: idCounter.value++,
          method: 'authenticate',
          params: [userAuth.value],
        }))
      }
      else if (options?.auth) {
        ws.send(JSON.stringify({
          id: idCounter.value++,
          method: 'authenticate',
          params: [toValue(options.auth)],
        }))
      }
    },
    onDisconnected() {
      idCounter.value = 0
    },
  })

  const data = computed(() => destr<RpcResponse<T> | null>(_data.value))

  function rpc<T = any>(req: RpcRequestWS<T>) {
    return _send(JSON.stringify({
      id: idCounter.value++,
      ...req,
    }))
  }

  function query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    vars?: MROGParam<T, 'query', 1>,
  ) {
    return rpc({
      method: 'query',
      params: [toValue(sql), toValue(vars)],
    })
  }

  return {
    close,
    _data,
    data,
    open,
    query,
    rpc,
    _send,
    sql: query,
    status,
    ws,
  }
}
