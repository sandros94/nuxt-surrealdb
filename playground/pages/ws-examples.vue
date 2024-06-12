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
      Data: {{ data ?? 'Connecting...' }}
    </pre>
    <pre>
      Logs: {{ logs }}
    </pre>
  </div>
</template>

<script setup lang="ts">
const { data, live } = useSurrealWS({ database: 'staging' })
live('products')

const logs = ref<any[]>([])
watch(data, () => logs.value.push(data.value))
</script>
