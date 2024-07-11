<template>
  <pre>{{ databases }}</pre>
</template>

<script setup lang="ts">
const databases = useSurrealDatabases()
</script>
