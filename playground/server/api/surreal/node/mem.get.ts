export default defineEventHandler(async (event) => {
  const client = await useSurrealMem(event)

  // TOTO: SurrealDB in-memory seems to have issues with storing data, but it does not crash

  await client.use({
    namespace: 'test',
    database: 'test',
  })
  const res = await client.query('REMOVE TABLE IF EXISTS test; CREATE test SET name = "from-node-mem"; SELECT * FROM test;').json().collect()
  return res[2]
})
