/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { defineNitroPlugin } from 'nitropack/runtime'

import {
  H3_CONTEXT_SURREAL_CLIENT,
  H3_CONTEXT_SURREAL_MEMORY,
  H3_CONTEXT_SURREAL_LOCAL,
} from '#surrealdb/internal'

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('afterResponse', async (event) => {
    if (event.context[H3_CONTEXT_SURREAL_CLIENT]) {
      await event.context[H3_CONTEXT_SURREAL_CLIENT].closeSession()
      delete event.context[H3_CONTEXT_SURREAL_CLIENT]
    }
    if (event.context[H3_CONTEXT_SURREAL_MEMORY]) {
      await event.context[H3_CONTEXT_SURREAL_MEMORY].closeSession()
      delete event.context[H3_CONTEXT_SURREAL_MEMORY]
    }
    if (event.context[H3_CONTEXT_SURREAL_LOCAL]) {
      await event.context[H3_CONTEXT_SURREAL_LOCAL].closeSession()
      delete event.context[H3_CONTEXT_SURREAL_LOCAL]
    }
  })
})
