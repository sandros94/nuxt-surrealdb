import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['#imports', '#app', '#surrealdb'],
})
