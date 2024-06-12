import type { UseWebSocketOptions } from '@vueuse/core'
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

export function useSurrealWS<T = any>(
  options?: UseWebSocketOptions & {
    database?: Overrides['database']
    auth?: string | null | false
  },
) {
  const { databases, defaultDatabase, auth: { database: authDatabase } } = useRuntimeConfig().public.surrealdb
  const { token: userAuth } = useSurrealAuth()

  const { auth, onConnected: _onConnected, onDisconnected: _onDisconnected, database, ...opts } = options || {}
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
      if (userAuth.value && options?.auth !== false && _database.value === databases[authDatabase as keyof typeof databases]) {
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
      _onConnected?.(ws)
    },
    onDisconnected(ws, event) {
      idCounter.value = 0
      _onDisconnected?.(ws, event)
    },
    ...opts,
  })

  const data = computed(() => destr<RpcResponse<T> | null>(_data.value))
  function send(data: Record<string, any>, useBuffer = true) {
    return _send(JSON.stringify(data), useBuffer)
  }

  function rpc<T = any>(req: RpcRequestWS<T>) {
    return send({
      id: idCounter.value++,
      ...req,
    })
  }

  // authenticate [ token ]
  function authenticate(
    token: MROGParam<any, 'authenticate', 0>,
  ) {
    return rpc({
      method: 'query',
      params: [toValue(token)],
    })
  }

  // create [ thing, data? ]
  function create<T = any>(
    thing: MROGParam<T, 'create', 0>,
    data?: MROGParam<T, 'create', 1>,
  ) {
    return rpc<T>({
      method: 'create',
      params: [toValue(thing), toValue(data)],
    })
  }

  // info
  function info<T = any>() {
    return rpc<T>({
      method: 'info',
    })
  }

  // insert [ thing, data? ]
  function insert<T = any>(
    thing: MROGParam<T, 'insert', 0>,
    data?: MROGParam<T, 'insert', 1>,
  ) {
    return rpc<T>({
      method: 'insert',
      params: [toValue(thing), toValue(data)],
    })
  }

  // invalidate
  function invalidate() {
    return rpc({
      method: 'invalidate',
    })
  }

  // kill [ thing ]
  function kill(
    thing: MROGParam<any, 'kill', 0>,
  ) {
    return rpc({
      method: 'kill',
      params: [toValue(thing)],
    })
  }

  // define [ name, value ] (`let` is a reserved word in JS)
  function define<T = any>(
    name: MROGParam<T, 'let', 0>,
    value: MROGParam<T, 'let', 1>,
  ) {
    return rpc<T>({
      method: 'let',
      params: [toValue(name), toValue(value)],
    })
  }

  // live [ table, diff? ]
  function live<T = any>(
    table: MROGParam<T, 'live', 0>,
    diff?: MROGParam<T, 'live', 1>,
  ) {
    return rpc<T>({
      method: 'live',
      params: [toValue(table), toValue(diff)],
    })
  }

  // merge [ thing, data ]
  function merge<T = any>(
    thing: MROGParam<T, 'merge', 0>,
    data: MROGParam<T, 'merge', 1>,
  ) {
    return rpc<T>({
      method: 'merge',
      params: [toValue(thing), toValue(data)],
    })
  }

  // patch [ thing, patches, diff? ]
  function patch<T = any>(
    thing: MROGParam<T, 'patch', 0>,
    patches: MROGParam<T, 'patch', 1>,
    diff?: MROGParam<T, 'patch', 2>,
  ) {
    return rpc<T>({
      method: 'patch',
      params: [toValue(thing), toValue(patches), toValue(diff)],
    })
  }

  // query [ sql, vars? ]
  function query<T = any>(
    sql: MROGParam<T, 'query', 0>,
    vars?: MROGParam<T, 'query', 1>,
  ) {
    return rpc<T>({
      method: 'query',
      params: [toValue(sql), toValue(vars)],
    })
  }

  // remove [ thing ] (`delete` is a reserved word in JS)
  function remove(
    thing: MROGParam<any, 'delete', 0>,
  ) {
    return rpc({
      method: 'delete',
      params: [toValue(thing)],
    })
  }

  // select [ thing ]
  function select<T = any>(
    thing: MROGParam<T, 'select', 0>,
  ) {
    return rpc<T>({
      method: 'select',
      params: [toValue(thing)],
    })
  }

  // signin [ ... ]
  function signin(
    auth: MROGParam<any, 'signin', 0>,
  ) {
    return rpc({
      method: 'signin',
      params: [toValue(auth)],
    })
  }

  // signup [ NS, DB, SC, ... ]
  function signup(
    auth: MROGParam<any, 'signup', 0>,
  ) {
    return rpc({
      method: 'signup',
      params: [toValue(auth)],
    })
  }

  // unset [ name ]
  function unset(
    name: MROGParam<any, 'unset', 0>,
  ) {
    return rpc({
      method: 'unset',
      params: [toValue(name)],
    })
  }

  // update [ thing, data? ]
  function update<T = any>(
    thing: MROGParam<T, 'update', 0>,
    data?: MROGParam<T, 'update', 1>,
  ) {
    return rpc<T>({
      method: 'update',
      params: [toValue(thing), toValue(data)],
    })
  }

  // use [ NS?, DB? ]
  function use(
    NS?: MROGParam<any, 'use', 0>,
    DB?: MROGParam<any, 'use', 1>,
  ) {
    if (!NS && !DB) {
      NS = _database.value.NS
      DB = _database.value.DB
    }
    return rpc({
      method: 'use',
      params: [toValue(NS), toValue(DB)],
    })
  }

  return {
    authenticate,
    close,
    create,
    _data,
    data,
    define,
    info,
    insert,
    invalidate,
    kill,
    live,
    merge,
    open,
    patch,
    query,
    remove,
    rpc,
    select,
    _send,
    send,
    signin,
    signup,
    sql: query,
    status,
    unset,
    update,
    use,
    ws,
  }
}
