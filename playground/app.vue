<template>
  <div>
    <pre v-if="data && !error">
      {{ data }}
    </pre>
    <div v-else-if="error">
      {{ error }}
    </div>
    <div v-else>
      Loading...
    </div>
    <hr>
    <div>
      <button @click="fetchSql()">
        Reload
      </button>
      <pre>
        {{ test ?? 'No Data' }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HttpRes } from '../src/runtime/types'

interface Product {
  id: string
  brand: string
  name: string
  price: number
  currency: string
}
const { sql } = useSurrealDB()
const { data, error } = await sql<HttpRes<Product[]>>('SELECT * FROM products;')

const test = ref<any>([])

async function fetchSql() {
  test.value = await useSurrealRPC({
    method: 'select',
    params: ['products'],
  })
}
</script>
