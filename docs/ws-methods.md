# RPC Websocket

The `useSurrealWS` composable exposes a Websocket connection to handle live communication with SurrealDB. It uses `useWebsocket` from `@vueuse/core` under the hood, this means that SSR, auto-connect and auto-disconnect are handled automatically by default. Data is Automatically parsed from `JSON` to `string` both in input as well in `data` return.
If available, upon Websocket connection, it will any Auth token from a prior user login. Database Presets and Websocket options are available as main arguments of the composable.

Below a list of the main method available from the Websocket composable:

```ts
const {
  authenticate,
  close,
  create,
  data,
  set,  // Surreal's `let`
  info,
  insert,
  invalidate,
  kill,
  live,
  merge,
  open,
  patch,
  query,
  remove,
  rpc,
  select,
  send,
  signin,
  signup,
  sql,     // alias for query
  status,
  unset,
  update,
  use,
  ws,
} = useSurrealWS()
```

:::warning
Currently while the `signin` and `signup` methods are avaible, they are limited to the current Websocket connection. Therefore if auth is required outside of that websocket connection it is advised to use the main `useSurrealAuth` composable for `SCOPE` user authentication.
:::
