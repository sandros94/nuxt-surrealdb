/**
 * The following is a custom implementation of Nuxt's useFetch composable.
 * It is meant to be used in a Nuxt project when connecting to third-party APIs,
 * while using a custom $fetch loaded as a Nuxt plugin.
 *
 * Source:
 * https://gist.github.com/sandros94/9105defd5f02d2614372da6d53023822
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type { FetchError, FetchOptions, FetchRequest as _FetchRequest } from 'ofetch'
import type { AvailableRouterMethod as _AvailableRouterMethod } from 'nitropack'
import type { MaybeRef, Ref, WatchSource } from 'vue'
import { computed, reactive, toValue } from 'vue'
import { hash } from 'ohash'

import type { AsyncData, AsyncDataOptions } from '#app'
import { useAsyncData, useNuxtApp, useSurrealPreset } from '#imports'
import type { Overrides } from '#surrealdb/types'
import {
  surrealFetchOptionsOverride,
} from '#surrealdb/utils/overrides'

type MultiWatchSources = (WatchSource<unknown> | object)[]

export type PickFrom<T, K extends Array<string>> = T extends Array<any>
  ? T
  : T extends Record<string, any>
    ? keyof T extends K[number]
      ? T // Exact same keys as the target, skip Pick
      : K[number] extends never
        ? T
        : Pick<T, K[number]>
    : T

export type KeysOf<T> = Array<
  T extends T // Include all keys of union types, not just common keys
    ? keyof T extends string
      ? keyof T
      : never
    : never
>

// Sobstitute for NitroFetchRequest
type FetchRequest = Exclude<_FetchRequest, string> | (string & {})

// Sobstitute for AvailableRouterMethod
type _AvailableMethods = 'get' | 'post' | 'patch' | 'delete' | 'search'
// support uppercase methods, detail: https://github.com/nuxt/nuxt/issues/22313
type AvailableMethods = _AvailableMethods | Uppercase<_AvailableMethods>

// Makes useSurrealFetch accept reactive properties
export type ComputedOptions<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Function ? T[K] : ComputedOptions<T[K]> | Ref<T[K]> | T[K]
}

interface CustomFetchOptions<M extends AvailableMethods = AvailableMethods> extends FetchOptions, Overrides {
  method?: M
  // Add more custom options here
}

export interface UseSurrealFetchOptions<
  ResT,
  DataT = ResT,
  DefaultT = undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  M extends AvailableMethods = AvailableMethods,
> extends Omit<AsyncDataOptions<ResT, DataT, PickKeys, DefaultT>, 'watch'>, ComputedOptions<CustomFetchOptions<M>> {
  key?: string
  $fetch?: typeof globalThis.$fetch
  watch?: MultiWatchSources | false
}

/**
 * Fetch data from an API endpoint with an SSR-friendly composable.
 * @param request The URL to fetch
 * @param opts extends $surrealFetch options and useAsyncData options
 */
export function useSurrealFetch<
  ResT = void,
  DataT = ResT,
  DefaultT = undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  ErrorT = FetchError,
  ReqT extends FetchRequest = FetchRequest,
  Method extends AvailableMethods = AvailableMethods,
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseSurrealFetchOptions<ResT, DataT, DefaultT, PickKeys, Method>
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>
export function useSurrealFetch<
  ResT = void,
  DataT = ResT,
  DefaultT = DataT,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  ErrorT = FetchError,
  ReqT extends FetchRequest = FetchRequest,
  Method extends AvailableMethods = AvailableMethods,
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  opts?: UseSurrealFetchOptions<ResT, DataT, DefaultT, PickKeys, Method>
): AsyncData<PickFrom<DataT, PickKeys> | DefaultT, ErrorT | undefined>
export function useSurrealFetch<
  ResT = void,
  DataT = ResT,
  DefaultT = undefined,
  PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
  ErrorT = FetchError,
  ReqT extends FetchRequest = FetchRequest,
  Method extends AvailableMethods = AvailableMethods,
>(
  request: Ref<ReqT> | ReqT | (() => ReqT),
  arg1?: string | UseSurrealFetchOptions<ResT, DataT, DefaultT, PickKeys, Method>,
  arg2?: string,
) {
  const { $surrealFetch } = useNuxtApp()
  const [opts = {}, autoKey] = typeof arg1 === 'string' ? [{}, arg1] : [arg1, arg2]

  const _request = computed(() => toValue(request))

  const _key = opts.key || hash([autoKey, typeof _request.value === 'string' ? _request.value : '', ...generateOptionSegments(opts)])
  if (!_key || typeof _key !== 'string') {
    throw new TypeError('[nuxt] [useSurrealFetch] key must be a string: ' + _key)
  }
  if (!request) {
    throw new Error('[nuxt] [useSurrealFetch] request is missing.')
  }

  const key = _key === autoKey ? '$d' + _key : _key

  if (!opts.baseURL && typeof _request.value === 'string' && (_request.value[0] === '/' && _request.value[1] === '/')) {
    throw new Error('[nuxt] [useSurrealFetch] the request URL must not start with "//".')
  }

  const {
    // AsyncData
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch,
    immediate,
    getCachedData,
    deep,
    dedupe,
    // custom
    database,
    token,
    // $fetch
    ...fetchOptions
  } = opts

  const _fetchOptions = reactive({
    ...fetchOptions,
    cache: typeof opts.cache === 'boolean' ? undefined : opts.cache,
  })

  if (database || token) {
    const db = reactive({
      database,
      token,
    })
    const _database = useSurrealPreset(db)
    _fetchOptions.baseURL ||= _database.host
    _fetchOptions.headers = {
      ...surrealFetchOptionsOverride(_database).headers,
    }
  }

  const _asyncDataOptions: AsyncDataOptions<ResT, DataT, PickKeys, DefaultT> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    immediate,
    getCachedData,
    deep,
    dedupe,
    watch: watch === false ? [] : [_fetchOptions, _request, ...(watch || [])],
  }

  if (import.meta.dev && import.meta.client) {
    // @ts-expect-error private property
    _asyncDataOptions._functionName = opts._functionName || 'useSurrealFetch'
  }

  let controller: AbortController

  const asyncData = useAsyncData<ResT, ErrorT, DataT, PickKeys, DefaultT>(key, () => {
    controller?.abort?.('Request aborted as another request to the same endpoint was initiated.')
    controller = typeof AbortController !== 'undefined' ? new AbortController() : {} as AbortController

    /**
     * Workaround for `timeout` not working due to custom abort controller
     * TODO: remove this when upstream issue is resolved
     * @see https://github.com/unjs/ofetch/issues/326
     * @see https://github.com/unjs/ofetch/blob/bb2d72baa5d3f332a2185c20fc04e35d2c3e258d/src/fetch.ts#L152
     */
    const timeoutLength = toValue(opts.timeout)
    let timeoutId: NodeJS.Timeout
    if (timeoutLength) {
      timeoutId = setTimeout(() => controller.abort('Request aborted due to timeout.'), timeoutLength)
      controller.signal.onabort = () => clearTimeout(timeoutId)
    }

    return $surrealFetch(_request.value, { signal: controller.signal, ..._fetchOptions } as any)
      .finally(() => { clearTimeout(timeoutId) }) as Promise<ResT>
  }, _asyncDataOptions)

  return asyncData
}

function generateOptionSegments<_ResT, DataT, DefaultT>(opts: UseSurrealFetchOptions<_ResT, DataT, DefaultT, any, any>) {
  const segments: Array<string | undefined | Record<string, string>> = [
    toValue(opts.method as MaybeRef<string | undefined> | undefined)?.toUpperCase() || 'GET',
    toValue(opts.baseURL),
  ]
  for (const _obj of [opts.params || opts.query]) {
    const obj = toValue(_obj)
    if (!obj) continue

    const unwrapped: Record<string, string> = {}
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value)
    }
    segments.push(unwrapped)
  }
  return segments
}

// import type { AsyncData } from 'nuxt/app'
// import type { FetchError } from 'ofetch'

// import type {
//   KeysOf,
//   PickFrom,
//   UseSurrealFetchOptions,
//   HttpResponseError,
// } from '#surrealdb/types/index'
// import {
//   surrealFetchOptionsOverride,
// } from '#surrealdb/utils/overrides'
// import type {
//   MaybeRefOrGetter,
// } from '#imports'
// import {
//   useFetch,
//   useNuxtApp,
//   useSurrealPreset,
// } from '#imports'

// export function useSurrealFetch<
//   ResT,
//   ErrorT = HttpResponseError,
//   DataT = ResT,
//   PickKeys extends KeysOf<DataT> = KeysOf<DataT>,
//   DefaultT = undefined,
// >(
//   endpoint: MaybeRefOrGetter<string>,
//   options: UseSurrealFetchOptions<ResT, DataT, PickKeys, DefaultT> = {},
// ): AsyncData<DefaultT | PickFrom<DataT, PickKeys>, FetchError<ErrorT> | null> {
//   const {
//     database,
//     token,
//     ...opts
//   } = options
//   const { $surrealFetch } = useNuxtApp()
//   const _database = useSurrealPreset({ database, token })
//   const { baseURL, headers } = surrealFetchOptionsOverride(_database)

//   return useFetch(endpoint, {
//     ...opts,
//     baseURL: opts.baseURL || baseURL,
//     headers: {
//       ...opts.headers,
//       ...headers,
//     },
//     $fetch: $surrealFetch,
//   })
// }
