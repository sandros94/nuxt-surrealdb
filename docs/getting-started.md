# Getting Started

This page demonstrates how to get started with the `nuxt-surrealdb` module.

## Quick Setup

Install the module to your Nuxt application:

```bash
npx nuxi module add nuxt-surrealdb
```

Then edit the `default` Database Preset inside your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      default: {
        host: 'https://example.com',
        ws: 'wss://example.com',
        NS: 'example',
        DB: 'example',
      },
    },
  },
})
```

## Environmental variables

Instead of hardcoding a Database preset inside the `nuxt.config.ts` you can edit it via env variables at runtime:

```dotenv
NUXT_PUBLIC_SURREALDB_DATABASES_DEFAULT_HOST="https://example.com"
NUXT_PUBLIC_SURREALDB_DATABASES_DEFAULT_WS="wss://example.com"
NUXT_PUBLIC_SURREALDB_DATABASES_DEFAULT_NS="example"
NUXT_PUBLIC_SURREALDB_DATABASES_DEFAULT_DB="example"
```

More on this in the dedicated [Database Preset guide](/database-presets).
