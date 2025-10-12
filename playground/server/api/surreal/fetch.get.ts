export default defineEventHandler(async (event) => {
  const { client } = await useSurreal(event)

  return client.query('SELECT * FROM test;')
})
