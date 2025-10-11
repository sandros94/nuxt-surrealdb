<template>
  <UContainer>
    <UCard class="mt-10">
      <p>
        Remote: Client
      </p>
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
const { data } = await useSurrealSelect(new Table('test'))
const { data: srv } = await useFetch('/api/surreal/fetch')
const { data: srvMem } = await useFetch('/api/surreal/node/mem')
const { data: srvLocal } = await useFetch('/api/surreal/node/local')

const mem = ref()
const local = ref()
const memClient = useSurrealMem()
const localClient = useSurrealLocal()

memClient?.use({
  namespace: 'test',
  database: 'test',
})
localClient?.use({
  namespace: 'test',
  database: 'test',
})
onNuxtReady(async () => {
  await Promise.all([
    memClient?.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-mem";'),
    localClient?.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-local";'),
  ])
  mem.value = await memClient?.query('SELECT * FROM test;')
  local.value = await localClient?.query('SELECT * FROM test;')
})
</script>
