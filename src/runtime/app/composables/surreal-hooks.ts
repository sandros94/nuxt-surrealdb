import { createHooks } from 'hookable'

import type { SurrealHooks } from '#surrealdb/types'

export const surrealHooks = createHooks<SurrealHooks>()
