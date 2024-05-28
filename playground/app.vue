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
        {{ _items ?? _itemsError }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Res } from '../src/runtime/types'

interface Product {
  id: string
  brand: string
  name: string
  price: number
  currency: string
}
const { items, sql, $sql, version } = useSurrealDB()
const { data: _items, error: _itemsError } = await items<Res<Product[]>>('products', {
  transform: (data: any) => {
    return data[0].status === 'OK' ? data[0].result : []
  },
})

const test = ref<Res<Product[]> | undefined>()

async function fetchSql() {
  test.value = await $sql<Res<Product[]>>('SELECT * FROM products;', {
    database: 'staging',
  })
}

const { data, error } = await sql<Res<Product[]>>('SELECT * FROM products;')
const { data: _version } = await version({
  database: 'staging',
})
</script>
