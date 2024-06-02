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
    <button @click="userInfo">
      Get user info
    </button>
  </div>
</template>

<script setup lang="ts">
const { data, rpc } = useSurrealWS('staging')

rpc({
  method: 'live',
  params: ['products'],
})
function userInfo() {
  rpc({
    method: 'info',
  })
}
</script>
