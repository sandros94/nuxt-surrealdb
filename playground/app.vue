<template>
  <pre v-if="data && !error">
    {{ data }}
  </pre>
  <div v-else-if="error">
    {{ error }}
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script setup lang="ts">
const { sql } = useSurrealDB()

const { data, error } = await sql('SELECT * FROM products;')
</script>
