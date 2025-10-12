import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event) => {
    if (event.context.surrealdb?.client) {
      await event.context.surrealdb.client.close()
      delete event.context.surrealdb
    }
  })
})
