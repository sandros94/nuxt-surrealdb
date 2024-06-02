<template>
  <div>
    <div style="display: inline-flex;">
      <NuxtLink to="/">
        Home
      </NuxtLink>
      <NuxtLink to="/fetch-examples">
        Fetch examples
      </NuxtLink>
    </div>
    <div>
      {{ _data }}
    </div>
    <button @click="userInfo">
      Get user info
    </button>
  </div>
</template>

<script setup lang="ts">
const { _data, rpc } = useSurrealWS()

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
