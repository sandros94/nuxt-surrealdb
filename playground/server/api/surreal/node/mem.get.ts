export default defineEventHandler(async (event) => {
  const client = await useSurrealMemory(event)

  // TOTO: SurrealDB in-memory seems to have issues with storing data, but it does not crash

  const [res] = await client.query('SELECT * FROM test;').json().collect(0)
  return res
})
