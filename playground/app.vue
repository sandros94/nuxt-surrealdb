<template>
  <div>
    <input v-model="search" placeholder="Table name">
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
    <input v-model="newProduct.brand" placeholder="Brand">
    <input v-model="newProduct.name" placeholder="Name">
    <input v-model="newProduct.price" placeholder="Price">
    <input v-model="newProduct.currency" placeholder="Currency">
    <button @click="executeCreate(); execute()">
      Create
    </button>
    <pre v-if="dataCreate">
      {{ dataCreate }}
    </pre>
    <hr>
    <label for="removeProduct">Remove product by id</label>
    <select id="removeProduct" v-model="removeProduct">
      <option
        v-for="product in data?.result || []"
        :key="product.id"
        :value="product.id"
      >
        {{ product.brand }}, {{ product.name }}
      </option>
    </select>
    <button @click="console.log(removeProduct); executeRemove(); execute()">
      Remove
    </button>
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

const { create, select, remove } = useSurrealDB()

const search = ref('products')
const { data, error, execute } = await select<Product[]>(search, {
  database: 'staging',
  watch: [search],
})

const newProduct = reactive<Partial<Product>>({})
const { data: dataCreate, execute: executeCreate } = await create<Product>('products', {
  data: newProduct,
  database: 'staging',
})

const removeProduct = ref('')
const { execute: executeRemove } = await remove(removeProduct, {
  database: 'staging',
})

error.value && console.error('error', error.value)
</script>
