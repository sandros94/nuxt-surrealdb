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
    <input
      v-model="newProduct.brand"
      placeholder="Brand"
    >
    <input
      v-model="newProduct.name"
      placeholder="Name"
    >
    <input
      v-model="newProduct.price"
      placeholder="Price"
    >
    <input
      v-model="newProduct.currency"
      placeholder="Currency"
    >
    <button @click="execute()">
      Create
    </button>
    <pre v-if="dataCreate">
      {{ dataCreate }}
    </pre>
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

const { create, select } = useSurrealDB()

const search = ref('products')

const { data, error } = await select<Product[]>(search, {
  database: 'staging',
  key: 'select',
})

const newProduct = reactive<Partial<Product>>({})
const { data: dataCreate, execute } = await create<Product>('products', {
  data: newProduct,
  database: 'staging',
})

error.value && console.error('error', error.value)
</script>
