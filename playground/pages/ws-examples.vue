<template>
  <div>
    <div style="display: inline-flex; gap: 1rem;">
      <NuxtLink to="/">
        Home
      </NuxtLink>
      <NuxtLink to="/fetch-examples">
        Fetch examples
      </NuxtLink>
    </div>
    <pre>
      {{ data }}
    </pre>
    <button @click="info()">
      Get user info
    </button>
  </div>
</template>

<script setup lang="ts">
const { data, info, live } = useSurrealWS('staging')

live('products')
</script>
