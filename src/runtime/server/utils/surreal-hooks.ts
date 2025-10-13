import { createHooks } from 'hookable'
import type { H3Event } from 'h3'

import type { SurrealHooks, SurrealServerOptions } from '#surrealdb/types'

export const surrealHooks = createHooks<SurrealHooks<SurrealServerOptions, { event?: H3Event }>>()
