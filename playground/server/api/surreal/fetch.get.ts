export default defineEventHandler(async (event) => {
  const { client } = await useSurreal(event)

  return client.select(new Table('test'))
})
