<template>
  <pre v-if="test && !error">
    {{ test }}
  </pre>
  <div v-else-if="error">
    {{ error }}
  </div>
  <div v-else>
    Loading...
  </div>
</template>

<script setup>
const { data: test, error } = await useSurrealFetch('sql', {
  method: 'POST',
  body: 'SELECT * FROM products',
})
</script>
