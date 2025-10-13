export default defineNuxtPlugin(() => {
  surrealHooks.hook('surrealdb:memory:connected', async ({ client }) => {
    await client.use({
      namespace: 'test',
      database: 'test',
    })
    await client.query('DEFINE TABLE IF NOT EXISTS test; UPSERT test SET name = "from-wasm-mem" WHERE name = "from-wasm-mem";')
  })
  surrealHooks.hook('surrealdb:local:connected', async ({ client }) => {
    await client.use({
      namespace: 'test',
      database: 'test',
    })
    await client.query('DEFINE TABLE IF NOT EXISTS test; UPSERT test SET name = "from-wasm-local" WHERE name = "from-wasm-local";')
  })
})
