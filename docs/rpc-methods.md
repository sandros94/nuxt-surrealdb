# RPC Methods

The main `useSurrealDB` exports a number of functions that directly communicate with the RPC endpoint. Each function has two variants, one starts with `$` and one without. The first is based on `$surrealRPC`, that provides the plain function, while the latter uses `useSurrealRPC`, taking advantage of `useSurrealFetch` (and thus, [`useFetch`](https://nuxt.com/docs/api/composables/use-fetch)).

Here the full list:

```ts
const {
  authenticate, // $authenticate
  create,       // $create
  delete,       // $delete
  info,         // $info
  insert,       // $insert
  invalidate,   // $invalidate
  merge,        // $merge
  patch,        // $patch
  query,        // $query
  remove,       // $remove
  select,       // $select
  signin,       // $signin
  signup,       // $signup
  sql,          // $sql
  update,       // $update
  version,      // $version
} = useSurrealDB()
```

:::tip
`sql` method is an alias for `query` while `version` uses its [HTTP endpoint](https://surrealdb.com/docs/surrealdb/integration/http#version).
:::