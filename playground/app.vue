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
const { data, error } = await useSurrealRPC<Product[]>({
  method: 'select',
  params: ['products'],
})
</script>
