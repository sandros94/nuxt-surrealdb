import { defineConfig } from 'vitepress'

const guide = {
  text: 'Guide',
  items: [
    { text: 'Getting Started', link: '/getting-started' },
    { text: 'Database Presets', link: '/database-presets' },
  ],
}

const methods = {
  text: 'RPC Methods',
  items: [
    {
      text: '',
      items: [
        { text: 'All RPC Methods', link: '/rpc-methods' },
      ],
    },
    {
      text: '',
      items: [
        { text: 'All WS Methods', link: '/ws-methods' },
      ],
    },
  ],
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Nuxt SurrealDB',
  description: 'A Nuxt module aimed to simplify the use of SurrealDB.',
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      guide,
      methods,
    ],

    sidebar: [
      guide,
      methods,
    ],

    footer: {
      message: 'Released under MIT License.',
      copyright: 'Copyright © 2024 Sandro Circi',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sandros94/nuxt-surrealdb' },
    ],
  },
})
