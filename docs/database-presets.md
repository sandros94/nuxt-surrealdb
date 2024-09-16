# Database Presets

You can define as many Database Presets as you want, both editable at runtime via `nuxt.config.ts` or via `.env`.

## Basic Usage

Database Presets are available under `surrealdb.databases` inside your `nuxt.config.ts`. Each preset will use the default database as the the starting point (using [`defu`](https://github.com/unjs/defu) under the hood).

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      default: {
        host: 'https://example.com',
        ws: 'wss://example.com',
        NS: 'production',
        DB: 'example',
      },

      website: {
        // This preset will inherit `host`, `ws` and `NS` from the default preset above
        DB: 'website',
      },

      crm: {
        host: 'https://crm.example.com',
        ws: 'wss://crm.example.com',
        NS: 'demo',
        DB: 'crm',
        // The following bearer token is exposed client side!
        auth: 'mySuperLongBearerToken',
      },

      shop: {
        host: '', // initialize any property that will be set via `.env`
        ws: '',
        NS: '',
        DB: '',
      },
    },
  },
})
```

```dotenv
NUXT_PUBLIC_SURREALDB_DATABASES_SHOP_HOST="https://example.com"
NUXT_PUBLIC_SURREALDB_DATABASES_SHOP_WS="wss://example.com"
NUXT_PUBLIC_SURREALDB_DATABASES_SHOP_NS="surrealdb"
NUXT_PUBLIC_SURREALDB_DATABASES_SHOP_DB="docs"
NUXT_PUBLIC_SURREALDB_DATABASES_SHOP_SC="user"
```

::: tip
When editing variables via `.env` to a custom preset, like the `shop` preset above, it is important to initialize any parameter as an empty string inside your `nuxt.config.ts`.
:::

### Database Presets for development

If you want to use different Database Presets between development and production, please use Nuxt's native [`$development` and `$production` properties](https://nuxt.com/docs/getting-started/configuration#environment-overrides) within your `nuxt.config.ts` like in the example below.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      default: {
        host: 'https://example.com',
        ws: 'wss://example.com',
        NS: 'production',
        DB: 'example',
      },
    },
  },
  $development: {
    surrealdb: {
      databases: {
        default: {
          host: 'http://localhost:8000',
          ws: 'ws://localhost:8000',
          NS: 'development',
        }
      }
    }
  },
  // ...
})
```

## Server-Side Database Presets

It is also possible to expand or change preset properties to be available only server-side. This becomes particularly useful for a more traditional database auth approach without exposing credentials client-side or to use a different `host` address in a private network. Server-Side Presets are availbale under `surrealdb.server.databases` (or `runtimeConfig.surrealdb.databases`) inside your `nuxt.config.ts`.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-surrealdb'],
  surrealdb: {
    databases: {
      default: {
        host: 'https://example.com',
        ws: 'wss://example.com',
        NS: 'production',
        DB: 'example',
      },
    },
    server: {
      databases: {
        default: {
          auth: {
            user: '', // then edit it via .env
            pass: '', // then edit it via .env
          },
        },
      },
    },
  },
})
```

```dotenv
NUXT_SURREALDB_DATABASES_SHOP_AUTH_USER="root"
NUXT_SURREALDB_DATABASES_SHOP_AUTH_PASS="password"
```

## Using Database Presets

To use any of your Database Preset you just have to set it within the last parameter of each main composable (functions destructured from `useSurrealDB` also support this override).

```ts
// all the functions destructured will be executed against the CRM database
const { query, select } = useSurrealDB({
  database: 'crm',
})

// only the following select will be made against the default database
const { data } = await select('products', {
  database: 'default',
})

// you could also define a one-time only preset
const { data } = await sql(
  'SELECT * FROM products WHERE price < $maxPrice;',
  { maxPrice: 500 },
  {
    database: {
      host: 'https://surrealdb.example.com',
      NS: 'demo',
      DB: 'shop',
    },
  },
)
```
