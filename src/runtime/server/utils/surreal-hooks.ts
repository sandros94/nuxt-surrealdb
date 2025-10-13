import { createHooks } from 'hookable'

import type { SurrealHooks, SurrealServerOptions } from '#surrealdb/types'

export const surrealHooks = createHooks<SurrealHooks<SurrealServerOptions>>()
