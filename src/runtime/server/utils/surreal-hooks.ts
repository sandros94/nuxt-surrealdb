import { createHooks } from 'hookable'
import type { H3Event } from 'h3'

import type { MaybePromise, SurrealSession, SurrealHooks } from '#surrealdb/types'

export const surrealHooks = createHooks<SurrealHooks & {
  'surrealdb:session:init': (args: { client: SurrealSession, event: H3Event }) => MaybePromise<void>
  'surrealdb:memory:session:init': (args: { client: SurrealSession, event: H3Event }) => MaybePromise<void>
  'surrealdb:local:session:init': (args: { client: SurrealSession, event: H3Event }) => MaybePromise<void>
}>()
