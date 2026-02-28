import { createHooks } from 'hookable'
import type { H3Event } from 'h3'

import type { MaybePromise, SurrealSession, SurrealHooks, SurrealServerOptions } from '../../types'

export const surrealHooks = createHooks<SurrealHooks<SurrealServerOptions> & {
  'surrealdb:session:init': (args: { session: SurrealSession, event: H3Event }) => MaybePromise<void>
  'surrealdb:memory:session:init': (args: { session: SurrealSession, event: H3Event }) => MaybePromise<void>
  'surrealdb:local:session:init': (args: { session: SurrealSession, event: H3Event }) => MaybePromise<void>
}>()
