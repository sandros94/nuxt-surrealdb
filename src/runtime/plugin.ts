import { defineNuxtPlugin, useCookie, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const {
    surrealdb: {
      url: baseURL,
      databases: {
        default: { ns, db },
      },
      tokenCookieName,
    },
  } = useRuntimeConfig().public
  const userAuth = useCookie(tokenCookieName)

  const $surrealFetch = $fetch.create({
    baseURL,
    onRequest({ options }) {
      options.headers = options.headers || {}

      if (ns) {
        // @ts-expect-error NS header type missing
        options.headers.NS = ns
      }
      if (db) {
        // @ts-expect-error DB header type missing
        options.headers.DB = db
      }
      if (userAuth.value) {
        // @ts-expect-error Authorization header type missing
        options.headers.Authorization = `Bearer ${userAuth.value}`
      }
    },
  })

  // Expose to useNuxtApp().$surrealFetch
  return {
    provide: {
      surrealFetch: $surrealFetch,
    },
  }
})
