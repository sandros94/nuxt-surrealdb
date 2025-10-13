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
const { data } = await useSurrealSelect(new Table('test'), select => select.where(eq('payload', 'ciao')))
const { data: srv } = await useFetch('/api/surreal/fetch')
const { data: srvMem } = await useFetch('/api/surreal/node/mem')
const { data: srvLocal } = await useFetch('/api/surreal/node/local')

const mem = ref()
const local = ref()
const memClient = await useSurrealMemory()
const localClient = await useSurrealLocal()

onNuxtReady(async () => {
  await Promise.all([
    memClient!.use({
      namespace: 'test',
      database: 'test',
    }),
    localClient!.use({
      namespace: 'test',
      database: 'test',
    }),
  ])
  const [memRes, localRes] = await Promise.all([
    memClient!.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-wasm-mem";SELECT * FROM test;').json().collect(),
    localClient!.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-wasm-local";SELECT * FROM test;').json().collect(),
  ])
  mem.value = memRes[2]
  local.value = localRes[2]
})
</script>
