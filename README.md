![nuxt-surrealdb](/docs/public/nuxt-surrealdb-social-card.png)

# Nuxt SurrealDB

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module aimed to simplify the use of [SurrealDB](https://surrealdb.com), wrapping the official [surrealdb.js](https://github.com/surrealdb/surrealdb.js) SDK.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [📖 &nbsp;Documentation](https://nuxt-surrealdb.s94.dev)

## Quick Setup

Install the module to your Nuxt application:

```bash
npx nuxi module add nuxt-surrealdb
```

Configure your SurrealDB endpoint in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    client: {
      endpoint: 'http://localhost:8000',
      connectOptions: {
        namespace: 'my_ns',
        database: 'my_db',
      },
    },
  },
})
```

## Features

- 🔌&nbsp;Wraps the official **surrealdb.js** SDK with auto-imported composables and server utils
- 🧩&nbsp;SSR-safe composables: `useSurrealQuery`, `useSurrealSelect`, `useSurrealAuth`, and more — all built on top of Nuxt's `useAsyncData`
- 🖥️&nbsp;Server utils with per-request session support via `useSurreal(event)` in Nitro event handlers
- ⚡️&nbsp;Embedded engines: run SurrealDB in-process with `@surrealdb/wasm` (client) or `@surrealdb/node` (server) for in-memory and local persistent storage
- 🪝&nbsp;Lifecycle hooks via `surrealHooks` for connection setup, authentication, and schema initialization
- 📦&nbsp;Auto-import of SurrealDB SDK classes (`RecordId`, `Table`, `Uuid`, etc.) and expression helpers (`eq`, `gt`, `contains`, etc.)
- 🔧&nbsp;Full configuration via `nuxt.config.ts` or environment variables

## Composables

### Client-side

| Composable | Description |
|------------|-------------|
| `useSurreal()` | Get the connected `Surreal` client |
| `useSurrealAsyncData(key, cb)` | Low-level SSR-safe wrapper around `useAsyncData` |
| `useSurrealQuery(query, bindings?)` | Execute a SurrealQL query with SSR support |
| `useSurrealSelect(table, builder?)` | Select records with a builder-pattern API |
| `useSurrealAuth()` | Get the currently authenticated user info |
| `useSurrealRun(name, args?)` | Execute a SurrealDB function |
| `useSurrealVersion()` | Get the SurrealDB server version |
| `useSurrealExport(options)` | Export the database |
| `useSurrealImport(input)` | Import a SurrealQL dump |
| `useSurrealMemory()` | Access the in-memory WASM client |
| `useSurrealLocal()` | Access the local WASM client |

### Server-side

| Util | Description |
|------|-------------|
| `useSurreal()` / `useSurreal(event)` | Get the remote client or a per-request session |
| `useSurrealMemory()` / `useSurrealMemory(event)` | In-memory Node engine (requires `@surrealdb/node`) |
| `useSurrealLocal()` / `useSurrealLocal(event)` | Local persistent Node engine (requires `@surrealdb/node`) |

## Environment Variables

Configuration maps to Nuxt runtime config. Override values using env vars:

```dotenv
# Client (public)
NUXT_PUBLIC_SURREALDB_ENDPOINT="http://localhost:8000"
NUXT_PUBLIC_SURREALDB_CONNECT_OPTIONS_NAMESPACE="my_ns"
NUXT_PUBLIC_SURREALDB_CONNECT_OPTIONS_DATABASE="my_db"

# Server-only
NUXT_SURREALDB_ENDPOINT="http://internal-surrealdb:8000"
NUXT_SURREALDB_SESSION="new"
NUXT_SURREALDB_LOCAL_ENDPOINT="surrealkv://./.data/db"
```

## Optional Dependencies

| Package | Purpose |
|---------|---------|
| `@surrealdb/wasm` | Client-side embedded engines (in-memory, IndexedDB) |
| `@surrealdb/node` | Server-side embedded engines (in-memory, SurrealKV) |

> [!WARNING]
> The IndexedDB (`indxdb://`) WASM engine is currently bugged upstream. In-memory mode works as expected.

---

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  pnpm install

  # Generate type stubs
  pnpm run dev:prepare

  # Develop with the playground
  pnpm run dev

  # Build the playground
  pnpm run dev:build

  # Run ESLint
  pnpm run lint

  # Run Vitest
  pnpm run test
  pnpm run test:watch

  # Release new version
  pnpm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-surrealdb/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-surrealdb

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-surrealdb.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-surrealdb

[license-src]: https://img.shields.io/npm/l/nuxt-surrealdb.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-surrealdb

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
