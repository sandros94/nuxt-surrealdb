<template>
  <UContainer>
    <UCard class="mt-10">
      <p>
        Remote: Client
      </p>
      <UInput v-model="tableNameRef" label="Table Name" />
      <ProsePre>
        {{ data }}
      </ProsePre>

      <p>
        Remote: Server
      </p>
      <ProsePre>
        {{ srv }}
      </ProsePre>

      <p>
        Wasm: Mem
      </p>
      <ProsePre>
        {{ mem }}
      </ProsePre>

      <p>
        Wasm: Local
      </p>
      <ProsePre>
        {{ local }}
      </ProsePre>

      <p>
        Node: Mem
      </p>
      <ProsePre>
        {{ srvMem }}
      </ProsePre>

      <p>
        Node: Local
      </p>
      <ProsePre>
        {{ srvLocal }}
      </ProsePre>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
const tableNameRef = ref('test')
const { data } = await useSurrealAsyncData('select:test', (client) => {
  return client
    .select(new Table(tableNameRef.value))
    .where(eq('payload', 'ciao'))
    .json()
}, {
  watch: [tableNameRef],
})
const { data: srv } = await useFetch('/api/surreal/fetch')
const { data: srvMem } = await useFetch('/api/surreal/node/mem')
const { data: srvLocal } = await useFetch('/api/surreal/node/local')

const mem = ref()
const local = ref()
const memClient = await useSurrealMemory()
const localClient = await useSurrealLocal()

onNuxtReady(async () => {
  const [[memRes], [localRes]] = await Promise.all([
    memClient!.query('SELECT * FROM test;').json().collect(0),
    localClient!.query('SELECT * FROM test;').json().collect(0),
  ])
  mem.value = memRes
  local.value = localRes
})
</script>
