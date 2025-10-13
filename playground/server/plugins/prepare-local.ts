export default defineNitroPlugin(() => {
  surrealHooks.hook('surrealdb:memory:connected', async ({ client }) => {
    await client.use({
      namespace: 'test',
      database: 'test',
    })
    await client.query('DEFINE TABLE IF NOT EXISTS test; UPSERT test SET name = "from-node-mem" WHERE name = "from-node-mem";')
  })
  surrealHooks.hook('surrealdb:local:connected', async ({ client }) => {
    await client.use({
      namespace: 'test',
      database: 'test',
    })
    await client.query('DEFINE TABLE IF NOT EXISTS test; UPSERT test SET name = "from-node-local" WHERE name = "from-node-local";')
  })
})
