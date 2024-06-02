import { useWebSocket } from '@vueuse/core'
import { joinURL } from 'ufo'

import type { Overrides, RpcRequestWS, RpcResponse } from '../types'
import { computed, ref, useRuntimeConfig, useSurrealAuth } from '#imports'

export function useSurrealWS<T = any>(database?: Overrides['database']) {
  const { databases, defaultDatabase } = useRuntimeConfig().public.surrealdb
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

  console.log(_database.value)

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
      ws.send(JSON.stringify({
        id: idCounter.value++,
        method: 'authenticate',
        params: [userAuth.value],
      }))
    },
    onDisconnected() {
      idCounter.value = 0
    },
  })

  function rpc<T = any>(req: RpcRequestWS<T>) {
    if (status.value !== 'OPEN') return
    return _send(JSON.stringify({
      id: idCounter.value++,
      ...req,
    }))
  }

  return {
    close,
    _data,
    open,
    rpc,
    _send,
    status,
    ws,
  }
}
