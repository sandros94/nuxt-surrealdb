export default defineEventHandler(async (event) => {
  const { client } = await useSurreal(event)

  return surrealJsonify(await client.select(new Table('test')))
})
