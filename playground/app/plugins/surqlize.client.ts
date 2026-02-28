// TODO: https://github.com/nuxt/module-builder/issues/141
import {} from 'nuxt/app'

import type { Orm } from 'surqlize'
import { orm, table, t } from 'surqlize'

export default defineNuxtPlugin({
  enforce: 'pre',
  dependsOn: ['surrealdb:memory'],
  parallel: true,
  setup() {
    const { $surrealMemory } = useNuxtApp()

    // Define a table schema
    const users = table('users', {
      name: t.string(),
      email: t.string(),
      age: t.number(),
      created: t.date(),
    })

    // Create ORM instance
    const db: Orm<[typeof users]> = orm($surrealMemory!, users)

    db.insert('users', {
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      created: new Date(),
    }).ignore()

    return {
      provide: {
        $surqlize: db,
      },
    }
  },
})
