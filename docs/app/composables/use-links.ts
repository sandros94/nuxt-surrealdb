export function useLinks() {
  const route = useRoute()

  return computed(() => [
    {
      label: 'Guide',
      icon: 'i-lucide-square-play',
      active: route.path.startsWith('/guide'),
      children: [
        {
          icon: 'i-lucide-arrow-right',
          label: 'Installation',
          description: 'Learn how to install Nuxt SurrealDB in your Nuxt application',
          to: '/guide/installation',
          active: route.path === '/guide/installation',
        },
        {
          icon: 'i-lucide-cog',
          label: 'Configuration',
          description: 'Learn how to configure Nuxt SurrealDB in your Nuxt application',
          to: '/guide/configuration',
          active: route.path === '/guide/configuration',
        },
        {
          icon: 'i-lucide-plug',
          label: 'Hooks',
          description: 'Learn how to use lifecycle hooks to customize SurrealDB connections',
          to: '/guide/hooks',
          active: route.path === '/guide/hooks',
        },
      ],
    },
    {
      label: 'Composables',
      icon: 'i-lucide-layers',
      active: route.path.startsWith('/composables'),
      children: [
        {
          icon: 'i-lucide-database',
          label: 'useSurreal',
          description: 'Access the remote SurrealDB client in your Vue components.',
          to: '/composables/use-surreal',
          active: route.path === '/composables/use-surreal',
        },
        {
          icon: 'i-lucide-loader',
          label: 'useSurrealAsyncData',
          description: 'SSR-safe async data fetching with the SurrealDB client.',
          to: '/composables/use-surreal-async-data',
          active: route.path === '/composables/use-surreal-async-data',
        },
        {
          icon: 'i-lucide-search',
          label: 'useSurrealQuery',
          description: 'Execute SurrealQL queries with SSR-safe async data.',
          to: '/composables/use-surreal-query',
          active: route.path === '/composables/use-surreal-query',
        },
        {
          icon: 'i-lucide-table',
          label: 'useSurrealSelect',
          description: 'Select records from a table or record ID with SSR support.',
          to: '/composables/use-surreal-select',
          active: route.path === '/composables/use-surreal-select',
        },
        {
          icon: 'i-lucide-shield',
          label: 'useSurrealAuth',
          description: 'Retrieve the currently authenticated user info.',
          to: '/composables/use-surreal-auth',
          active: route.path === '/composables/use-surreal-auth',
        },
        {
          icon: 'i-lucide-list',
          label: 'Other Composables',
          description: 'Additional SSR-safe composables for SurrealDB operations.',
          to: '/composables/other-composables',
          active: route.path === '/composables/other-composables',
        },
      ],
    },
    {
      label: 'Server',
      icon: 'i-lucide-server',
      active: route.path.startsWith('/server'),
      children: [
        {
          icon: 'i-lucide-server',
          label: 'useSurreal',
          description: 'Access the SurrealDB client in your Nitro server handlers.',
          to: '/server/use-surreal',
          active: route.path === '/server/use-surreal',
        },
        {
          icon: 'i-lucide-memory-stick',
          label: 'useSurrealMemory',
          description: 'Access the in-memory SurrealDB Node engine on the server.',
          to: '/server/use-surreal-memory',
          active: route.path === '/server/use-surreal-memory',
        },
        {
          icon: 'i-lucide-hard-drive',
          label: 'useSurrealLocal',
          description: 'Access the local persistent SurrealDB Node engine on the server.',
          to: '/server/use-surreal-local',
          active: route.path === '/server/use-surreal-local',
        },
      ],
    },
  ])
}
