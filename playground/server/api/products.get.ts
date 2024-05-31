export default eventHandler(async (event) => {
  return surrealRPC(event, {
    method: 'select',
    params: ['products'],
  }, {
    database: 'staging',
  })
})
