export default defineEventHandler(async (event) => {
  const client = await useSurrealLocal(event, {
    endpoint: 'surrealkv://./.data/db',
  })

  const [res] = await client.query('SELECT * FROM test;').json().collect(0)
  return res
})
