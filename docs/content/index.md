---
seo:
  title: Nuxt SurrealDB - Docs
  description: A Nuxt module aimed to simplify the use of SurrealDB SDK.
---

::u-page-hero
---
orientation: horizontal
---
  :::prose-pre{filename="Terminal" code="npx nuxi module add nuxt-surrealdb"}
  ```bash
  npx nuxi module add nuxt-surrealdb
  ```
  :::

#title
SurrealDB

made easy

#description
A Nuxt module that wraps the official SurrealDB JavaScript SDK, providing auto-imported composables, server utils, and support for remote, in-memory, and local embedded databases.

#links
  :::u-button
  ---
  size: xl
  to: /guide/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::
::

::u-page-section
#title
Integrated concepts and features

#features
  :::u-page-feature
  ---
  icon: i-lucide-cog
  to: /guide/configuration
  ---
  #title
  Flexible Configuration

  #description
  Configure remote, in-memory, and local embedded SurrealDB connections via `nuxt.config.ts` or environment variables.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-layers
  to: /composables/use-surreal
  ---
  #title
  Auto-imported Composables

  #description
  Use `useSurreal`, `useSurrealQuery`, `useSurrealSelect`, and more with SSR-safe `useAsyncData` wrappers.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-server
  to: /server/use-surreal
  ---
  #title
  Server Utils

  #description
  Auto-imported server utils with session support for per-request isolation in your Nitro event handlers.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database
  to: /guide/configuration#embedded-engines
  ---
  #title
  Embedded Engines

  #description
  Run SurrealDB directly in-process via `@surrealdb/wasm` (client) or `@surrealdb/node` (server) for in-memory and local persistent storage.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-plug
  to: /guide/hooks
  ---
  #title
  Lifecycle Hooks

  #description
  Hook into `surrealdb:connecting` and `surrealdb:connected` events to run setup logic like authentication or schema initialization.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-import
  to: /guide/configuration#auto-imports
  ---
  #title
  SDK Auto-imports

  #description
  SurrealDB SDK classes like `RecordId`, `Table`, `Uuid`, and expression helpers are auto-imported in both app and server contexts.
  :::
::
