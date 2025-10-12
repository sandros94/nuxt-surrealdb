export default defineEventHandler(async (event) => {
  const client = await useSurrealLocal(event, {
    endpoint: 'surrealkv://./.data/db',
  })

  await client.use({
    namespace: 'test',
    database: 'test',
  })
  const res = await client.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-node-local";SELECT * FROM test;')
  return res[2]
})
