<template>
  <div>
    <input
      v-model="search"
      placeholder="Table name"
    >
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
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string
  brand: string
  name: string
  price: number
  currency: string
}

const { select } = useSurrealDB()

const search = ref('products')

const { data, error } = await select<Product[]>(search)

error.value && console.error('error', error.value)
</script>
