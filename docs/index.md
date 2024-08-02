---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Nuxt SurrealDB"
  text: "A Nuxt module aimed to simplify the use of SurrealDB."
  image:
    src: /surrealdb-logo.png
    alt: SurrealDB
  actions:
    - theme: brand
      text: Getting Started
      link: /getting-started
    - theme: alt
      text: DB Presets
      link: /database-presets
    - theme: alt
      text: RPC Methods
      link: /rpc-methods
    - theme: alt
      text: View on GitHub
      link: https://github.com/sandros94/nuxt-surrealdb

features:
  - title: Custom Database Presets
    details: Quickly access multiple Namespaces and Databases. Presets can have different properties between client and server side use.
    icon: 📦
  - title: Nuxt-optimized fetch composables
    details: Built-in <b>$surrealFetch</b> and <strong>useSurrealFetch</strong>, based on <strong>$fetch</strong> and <strong>useFetch</strong> respectively.
    icon: 🚀
  - title: SurrealDB RPC Methods
    details: With <strong>$surrealRPC</strong> and <strong>useSurrealRPC</strong> it is possible to directly communicate with SurrealDB's RPC endpoint. Each RPC method is also mapped to a <strong>useSurrealDB</strong> exported function.
    icon: 🏗️
  - title: Built-in support for Websockets
    details: Thanks to <strong>useSurrealWS</strong> a live connection to SurrealDB is automated and augmented via available RPC methods.
    icon: ⚡️
---
