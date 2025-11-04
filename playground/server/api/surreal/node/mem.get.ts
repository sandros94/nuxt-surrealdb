export default defineEventHandler(async () => {
  const client = await useSurrealMemory()

  const [res] = await client.query('SELECT * FROM test;').json().collect(0)
  return res
})
