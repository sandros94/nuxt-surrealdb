export default defineEventHandler(async () => {
  const client = await useSurreal()

  return await client.select(new Table('test')).json()
})
