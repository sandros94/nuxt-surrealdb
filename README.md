# Nuxt SurrealDB

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module aimed to simplify the use of [SurrealDB](https://surrealdb.com).

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/sandros94/nuxt-surrealdb?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## WIP

This module is still under development and not suitable for production use, proceed at your own risk. Expect breaking changes!
There are no docs atm, so please refer to the [playground](/playground/app.vue) or the [source code](/src/).

## Roadmap

- [x] custom fetch plugin and composable.
- [ ] ~~on PAR with the official [SurrealDB Rest integration](https://surrealdb.com/docs/surrealdb/integration/http).~~
- [ ] on PAR with the official [SurrealDB RPC integration](https://surrealdb.com/docs/surrealdb/integration/rpc).
- [ ] auth support.
- [ ] custom websocket composable.

## Features

<!-- Highlight some of the features your module provide here -->
- 🚀 &nbsp;Custom built-in `$surrealFetch` and `useSurrealFetch`.
- 📦 &nbsp;Custom Database Presets, each with its `host`, `namespace`, `database`, `auth` (optional)

### Database Presets

It is possible to customize the `default` preset or define your own Database presets either via `nuxt.config.ts` or `.env`.

> [!NOTE]
> When passing variables to a custom preset like `production` below, it is important to initialize it as an empty object inside `nuxt.config.ts`

```dotenv
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_HOST="https://example.com"
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_NS="surrealdb"
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_DB="docs"

# For auth
# user and pass separated by a colon
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_AUTH="root:root"
# Or as a Bearer
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_AUTH="Bearer mySuperLongBearerToken"
# Or as an object
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_AUTH_USER="root"
NUXT_PUBLIC_SURREALDB_DATABASES_PRODUCTION_AUTH_PASS="root"
```

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      staging: {
        host: 'https://staging.example.com',
        NS: 'staging',
        DB: 'demo',

        // Auth examples
        auth: 'root:root'
        auth: 'Bearer mySuperLongBearerToken'
        auth: {
          user: 'root',
          pass: 'root'
        }
      },
      production: {},
    },
  },
  // ...
})
```

---

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-surrealdb
```

That's it! You can now use Nuxt SurrealDB in your Nuxt app ✨


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
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
