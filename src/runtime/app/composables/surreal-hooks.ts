import { createHooks } from 'hookable'

import type { SurrealHooks, SurrealClientOptions } from '../../types'

export const surrealHooks = createHooks<SurrealHooks<SurrealClientOptions>>()
