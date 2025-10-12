export default defineEventHandler(async (event) => {
  const client = await useSurrealMem(event)

  // TOTO: SurrealDB in-memory seems to have issues with storing data, but it does not crash

  client.use({
    namespace: 'test',
    database: 'test',
  })
  await client.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-mem";')
  return client.query('SELECT * FROM test;')
})
