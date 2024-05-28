import { defineNuxtPlugin, useCookie, useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const {
    surrealdb: {
      databases: { default: { host: baseURL, NS, DB } },
      tokenCookieName,
    },
  } = useRuntimeConfig().public
  const userAuth = useCookie(tokenCookieName)

  const $surrealFetch = $fetch.create({
    baseURL,
    onRequest({ options }) {
      options.headers = options.headers || {}

      // @ts-expect-error NS header type missing
      if (NS && !options.headers.NS) {
        // @ts-expect-error NS header type missing
        options.headers.NS = NS
      }
      // @ts-expect-error DB header type missing
      if (DB && !options.headers.DB) {
        // @ts-expect-error DB header type missing
        options.headers.DB = DB
      }
      // @ts-expect-error Authorization header type missing
      if (userAuth.value && !options.headers.Authorization) {
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
