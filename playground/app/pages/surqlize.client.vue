<template>
  <UContainer>
    <UCard>
      <p>
        Surqlize
      </p>
      <ProsePre>
        {{ data }}
      </ProsePre>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { Orm } from 'surqlize'
import { orm, table, t } from 'surqlize'

const data = ref<{ name: string, email: string, age: number, created: Date }[]>([])
onNuxtReady(async () => {
  const client = (await useSurrealMemory())!

  await client.query(`DEFINE TABLE OVERWRITE users;
DEFINE FIELD OVERWRITE name ON users TYPE string;
DEFINE FIELD OVERWRITE email ON users TYPE string;
DEFINE FIELD OVERWRITE age ON users TYPE number;
DEFINE FIELD OVERWRITE created ON users TYPE datetime;

DEFINE INDEX OVERWRITE userEmailIndex ON users COLUMNS email UNIQUE;
`)

  // Define a table schema
  const users = table('users', {
    name: t.string(),
    email: t.string(),
    age: t.number(),
    created: t.date(),
  })

  // Create ORM instance
  const db: Orm<[typeof users]> = orm(client, users)

  await db.insert('users', {
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 30,
    created: new Date(),
  }).ignore()

  data.value = await db
    .select('users')
    .where(users => users.age.gte(18))
})
</script>
