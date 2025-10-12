export default defineEventHandler(async (event) => {
  const client = await useSurrealLocal(event, {
    endpoint: 'surrealkv://./.data/db',
  })

  client.use({
    namespace: 'test',
    database: 'test',
  })
  await client.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-local";')
  return client.query('SELECT * FROM test;')
})
