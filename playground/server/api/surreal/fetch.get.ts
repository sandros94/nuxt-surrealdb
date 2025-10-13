export default defineEventHandler(async (event) => {
  const { client } = await useSurreal(event)

  return await client.select(new Table('test')).json()
})
