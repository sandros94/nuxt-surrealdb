import { createHooks } from 'hookable'

import type { SurrealHooks, SurrealClientOptions } from '#surrealdb/types'

export const surrealHooks = createHooks<SurrealHooks<SurrealClientOptions>>()
