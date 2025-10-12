export default defineEventHandler(async (event) => {
  const { client } = useSurreal(event)

  return client.query('SELECT * FROM test;')
})
