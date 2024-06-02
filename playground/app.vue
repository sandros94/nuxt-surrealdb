<template>
  <div>
    <div style="display: flex; flex: auto; flex-direction: row; width: 100svw; gap: 1rem;">
      <div style="width: fit-content; border-right: 1px solid #aaa; padding-right: 1rem;">
        <input v-model="search" placeholder="Table name">
        <pre v-if="data && !error">
          {{ data }}
        </pre>
        <div v-else-if="error" style="color: crimson;">
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
      <div style="width: fit-content;">
        <div v-if="!session.user">
          <h2>Login</h2>
          <input v-model="credentials.username" placeholder="Username">
          <input v-model="credentials.password" placeholder="Password">
          <button @click="signin(credentials)">
            Sign in
          </button>
        </div>
        <div v-else>
          <h2>User</h2>
          <pre>
            {{ session.user }}
          </pre>
          <button @click="signout()">
            Sign out
          </button>
          <button @click="refreshInfo()">
            Refresh Info
          </button>
        </div>
      </div>
    </div>
    <hr>
    <div v-if="forcedError">
      This is a forced error, cought by <b>
        useSurrealRPC:
      </b>
      <div style="color: crimson;">
        {{ forcedError }}
      </div>
    </div>
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

const { create, remove, select, sql } = useSurrealDB({
  database: 'staging',
})

const search = ref('products')
const { data, error, execute } = await select<Product[]>(search, {
  watch: [search],
})
error.value && console.error('error', error.value)

const newProduct = reactive<Partial<Product>>({})
const { data: dataCreate, execute: executeCreate } = await create<Product>('products', {
  data: newProduct,
})

const removeProduct = ref('')
const { execute: executeRemove } = await remove(removeProduct)

const { error: forcedError } = await sql<Product[]>('SELECT * ROM products;', {
  server: false,
})

const { signin, signout, session, refreshInfo } = useSurrealAuth()
interface UserCredentials {
  username?: string
  password?: string
  SC: string
}
const credentials = reactive<UserCredentials>({
  SC: 'user',
})
</script>
