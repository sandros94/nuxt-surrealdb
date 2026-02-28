export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
      info: 'sky',
    },
  },
  uiPro: {
    footer: {
      slots: {
        root: 'border-t border-(--ui-border)',
        left: 'text-sm text-(--ui-text-muted)',
      },
    },
  },
  seo: {
    siteName: 'Nuxt SurrealDB - Docs',
  },
  header: {
    title: 'Nuxt SurrealDB',
    to: '/',
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/sandros94/nuxt-surrealdb',
      'target': '_blank',
      'aria-label': 'GitHub',
    }],
  },
  footer: {
    credits: `Copyright © ${new Date().getFullYear()}`,
    colorMode: false,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/sandros94/nuxt-surrealdb',
        'target': '_blank',
        'aria-label': 'Nuxt SurrealDB',
      }, {
        'icon': 'i-simple-icons-bluesky',
        'to': 'https://bsky.app/profile/sandros94.com',
        'target': '_blank',
        'aria-label': 'Sandros94 on BlueSky',
      },
    ],
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/sandros94/nuxt-surrealdb/edit/main/docs/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/sandros94/nuxt-surrealdb',
          target: '_blank',
        },
      ],
    },
  },
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 7500,
  },
})
