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
      <pre>
        {{ _version }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Response } from '../src/runtime/types'

interface Product {
  id: string
  brand: string
  name: string
  price: number
  currency: string
}

const { sql, $sql, version } = useSurrealDB()
const test = ref<Response<Product[]> | undefined>()

async function fetchSql() {
  test.value = await $sql<Product[]>('SELECT * FROM products;', {
    database: 'staging',
  })
}

const { data, error } = await sql('SELECT * FROM products;')
const { data: _version } = await version({
  database: 'staging',
})
</script>
