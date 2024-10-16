export default eventHandler(async (_) => {
  return useSurrealRPC({
    method: 'select',
    params: ['products'],
  }, {
    database: 'staging',
  })
})
