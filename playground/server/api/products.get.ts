export default eventHandler(async (event) => {
  return useSurrealRPC(event, {
    method: 'select',
    params: ['products'],
  }, {
    database: 'staging',
  })
})
