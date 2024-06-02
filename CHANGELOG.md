# Changelog


## v0.0.5

[compare changes](https://github.com/sandros94/nuxt-surrealdb/compare/v0.0.4...v0.0.5)

### 🚀 Enhancements

- **useSurrealAuth:** New composable ([2ed09c2](https://github.com/sandros94/nuxt-surrealdb/commit/2ed09c2))
- **useSurrealAuth:** `SC` param per database preset ([a054de8](https://github.com/sandros94/nuxt-surrealdb/commit/a054de8))
- Server-side database preset customization ([7568bde](https://github.com/sandros94/nuxt-surrealdb/commit/7568bde))
- DefaultDatabase selection ([c8b11d9](https://github.com/sandros94/nuxt-surrealdb/commit/c8b11d9))

### 🩹 Fixes

- Use `message` in createError to handle longer messages ([eb5b410](https://github.com/sandros94/nuxt-surrealdb/commit/eb5b410))

### 🏡 Chore

- **release:** V0.0.4 ([39a582d](https://github.com/sandros94/nuxt-surrealdb/commit/39a582d))

### ❤️ Contributors

- Sandros94 ([@Sandros94](http://github.com/Sandros94))

## v0.0.4

[compare changes](https://github.com/sandros94/nuxt-surrealdb/compare/v0.0.3...v0.0.4)

### 🚀 Enhancements

- **surrealFetch & surrealRPC:** New server utils ([e577733](https://github.com/sandros94/nuxt-surrealdb/commit/e577733))
- Catch RPC errors ([358d41c](https://github.com/sandros94/nuxt-surrealdb/commit/358d41c))

### 📖 Documentation

- Move roadmap to issue ([ad99533](https://github.com/sandros94/nuxt-surrealdb/commit/ad99533))

### 🏡 Chore

- Fix builds ([8387783](https://github.com/sandros94/nuxt-surrealdb/commit/8387783))

### ❤️ Contributors

- Sandros94 ([@Sandros94](http://github.com/Sandros94))

## v0.0.3

[compare changes](https://github.com/sandros94/nuxt-surrealdb/compare/v0.0.2...v0.0.3)

### 🚀 Enhancements

- Query alias for sql function ([e6a165a](https://github.com/sandros94/nuxt-surrealdb/commit/e6a165a))
- Dedicated SurrealRpcOptions type ([474e513](https://github.com/sandros94/nuxt-surrealdb/commit/474e513))
- **select:** New function ([ee50c3e](https://github.com/sandros94/nuxt-surrealdb/commit/ee50c3e))
- More type improvements ([60b11fe](https://github.com/sandros94/nuxt-surrealdb/commit/60b11fe))
- **useSurrealRPC:** Type improvements and key defaults ([6f95e1e](https://github.com/sandros94/nuxt-surrealdb/commit/6f95e1e))
- **useSurrealDB:** Functions params type improvements ([1c7472c](https://github.com/sandros94/nuxt-surrealdb/commit/1c7472c))
- **create:** New useSurrealDB function ([bf7ab64](https://github.com/sandros94/nuxt-surrealdb/commit/bf7ab64))
- **remove:** New useSurrealDB function ([5467290](https://github.com/sandros94/nuxt-surrealdb/commit/5467290))
- **insert:** New useSurrealDB function ([fd46b99](https://github.com/sandros94/nuxt-surrealdb/commit/fd46b99))
- **merge:** New useSurrealDB function ([f2d9e7a](https://github.com/sandros94/nuxt-surrealdb/commit/f2d9e7a))
- **patch:** New useSurrealDB function ([2b46de0](https://github.com/sandros94/nuxt-surrealdb/commit/2b46de0))
- **update:** New useSurrealDB function ([9e38976](https://github.com/sandros94/nuxt-surrealdb/commit/9e38976))
- **authenticate:** New useSurrealDB function ([6bd0c09](https://github.com/sandros94/nuxt-surrealdb/commit/6bd0c09))
- **info:** New useSurrealDB function ([dda55a2](https://github.com/sandros94/nuxt-surrealdb/commit/dda55a2))
- **invalidate:** New useSurrealDB function ([8486d42](https://github.com/sandros94/nuxt-surrealdb/commit/8486d42))
- **singin & singup:** New useSurrealDB functions ([2ec9235](https://github.com/sandros94/nuxt-surrealdb/commit/2ec9235))

### 🩹 Fixes

- Wrong useAsyncData base key ([a9491ef](https://github.com/sandros94/nuxt-surrealdb/commit/a9491ef))
- Rpc types ([c5a1eb9](https://github.com/sandros94/nuxt-surrealdb/commit/c5a1eb9))
- **useSurrealRPC:** Simplify reactivity layers ([d304f4a](https://github.com/sandros94/nuxt-surrealdb/commit/d304f4a))
- **useSurrealRPC:** Missing return type ([559f0b9](https://github.com/sandros94/nuxt-surrealdb/commit/559f0b9))
- Types and useSurrealRPC keys ([87df8a0](https://github.com/sandros94/nuxt-surrealdb/commit/87df8a0))
- **useSurrealRPC:** Reactivity ([1c3aeac](https://github.com/sandros94/nuxt-surrealdb/commit/1c3aeac))
- Allow override watch: false ([2e98fa8](https://github.com/sandros94/nuxt-surrealdb/commit/2e98fa8))
- **useSurrealDB:** Database preset override ([9ee177d](https://github.com/sandros94/nuxt-surrealdb/commit/9ee177d))

### 💅 Refactors

- $surrealFetchOptionsOverride ([e6276dc](https://github.com/sandros94/nuxt-surrealdb/commit/e6276dc))
- Use rpc for sql function ([98b0b0e](https://github.com/sandros94/nuxt-surrealdb/commit/98b0b0e))
- Standardize parameters names ([5bfe95a](https://github.com/sandros94/nuxt-surrealdb/commit/5bfe95a))

### 📖 Documentation

- Fix readme ([27f70f9](https://github.com/sandros94/nuxt-surrealdb/commit/27f70f9))
- **fix:** Database preset initialization ([cc5a493](https://github.com/sandros94/nuxt-surrealdb/commit/cc5a493))
- Update readme ([9623f53](https://github.com/sandros94/nuxt-surrealdb/commit/9623f53))

### 🏡 Chore

- Reorganize types ([200d159](https://github.com/sandros94/nuxt-surrealdb/commit/200d159))
- Remove leftover ([32efb65](https://github.com/sandros94/nuxt-surrealdb/commit/32efb65))
- Update eslint config ([78ef3d3](https://github.com/sandros94/nuxt-surrealdb/commit/78ef3d3))
- Update comments ([c769904](https://github.com/sandros94/nuxt-surrealdb/commit/c769904))
- More type fixes ([cb51514](https://github.com/sandros94/nuxt-surrealdb/commit/cb51514))

### ❤️ Contributors

- Sandros94 ([@Sandros94](http://github.com/Sandros94))

## v0.0.2

[compare changes](https://github.com/sandros94/nuxt-surrealdb/compare/v0.0.1...v0.0.2)

### 🚀 Enhancements

- **useSurrealRPC:** New composable ([d48709f](https://github.com/sandros94/nuxt-surrealdb/commit/d48709f))
- Support auth per db preset ([c55c1c5](https://github.com/sandros94/nuxt-surrealdb/commit/c55c1c5))
- Wrap rpc fetch in asyncData ([3473932](https://github.com/sandros94/nuxt-surrealdb/commit/3473932))

### 🩹 Fixes

- Add content-type header ([34b33d6](https://github.com/sandros94/nuxt-surrealdb/commit/34b33d6))

### 📖 Documentation

- Update readme ([7285c13](https://github.com/sandros94/nuxt-surrealdb/commit/7285c13))

### 🏡 Chore

- **release:** V0.0.1 ([42b6bbe](https://github.com/sandros94/nuxt-surrealdb/commit/42b6bbe))

### ❤️ Contributors

- Sandros94 ([@Sandros94](http://github.com/Sandros94))

## v0.0.1


### 🚀 Enhancements

- **useSurrealFetch:** Optional overrides ([d20e563](https://github.com/sandros94/nuxt-surrealdb/commit/d20e563))
- **useSurrealDB:** Sql function ([688d9c2](https://github.com/sandros94/nuxt-surrealdb/commit/688d9c2))
- ⚠️  Use `host` instead of `url` to define db hostname ([9a777e2](https://github.com/sandros94/nuxt-surrealdb/commit/9a777e2))
- SurrealFetch function to everride preferences ([395f906](https://github.com/sandros94/nuxt-surrealdb/commit/395f906))
- **$sql:** New function ([8322d3d](https://github.com/sandros94/nuxt-surrealdb/commit/8322d3d))
- **version:** New function ([42a2e74](https://github.com/sandros94/nuxt-surrealdb/commit/42a2e74))
- **useSurrealLazyFetch:** New composable ([6547eaa](https://github.com/sandros94/nuxt-surrealdb/commit/6547eaa))
- **items:** New function ([0d4856a](https://github.com/sandros94/nuxt-surrealdb/commit/0d4856a))
- **items:** Use useAsyncData to catch input errors ([58f6950](https://github.com/sandros94/nuxt-surrealdb/commit/58f6950))

### 🩹 Fixes

- Better follow naming conventions ([8fdd2e0](https://github.com/sandros94/nuxt-surrealdb/commit/8fdd2e0))
- **useSurrealFetch:** Don't force bearer token ([42a7792](https://github.com/sandros94/nuxt-surrealdb/commit/42a7792))
- Default database as optional ([af6745d](https://github.com/sandros94/nuxt-surrealdb/commit/af6745d))
- Move databasepreset type ([aa1fdaf](https://github.com/sandros94/nuxt-surrealdb/commit/aa1fdaf))
- **useSurrealFetch:** Support MaybeReforGetter url ([f936d02](https://github.com/sandros94/nuxt-surrealdb/commit/f936d02))
- **useSurrealFetch:** Variable naming convention ([d5f47ee](https://github.com/sandros94/nuxt-surrealdb/commit/d5f47ee))
- **useSurrealFetch:** Header overwrite ([c3b4d37](https://github.com/sandros94/nuxt-surrealdb/commit/c3b4d37))
- Default to any input type ([dbf4171](https://github.com/sandros94/nuxt-surrealdb/commit/dbf4171))
- Simplify the Response utility type ([23634d4](https://github.com/sandros94/nuxt-surrealdb/commit/23634d4))
- **$surrealFetch:** Force app/json by default ([00609f2](https://github.com/sandros94/nuxt-surrealdb/commit/00609f2))
- Use $config inside plugin ([f9c311d](https://github.com/sandros94/nuxt-surrealdb/commit/f9c311d))
- Module build ([1acc440](https://github.com/sandros94/nuxt-surrealdb/commit/1acc440))

### 💅 Refactors

- Use db presets ([9cdd32c](https://github.com/sandros94/nuxt-surrealdb/commit/9cdd32c))

### 📖 Documentation

- Update readme ([f51c46f](https://github.com/sandros94/nuxt-surrealdb/commit/f51c46f))

### 🏡 Chore

- Project init ([c4be853](https://github.com/sandros94/nuxt-surrealdb/commit/c4be853))
- Update playground ([5cb04a5](https://github.com/sandros94/nuxt-surrealdb/commit/5cb04a5))
- Update release script ([d899635](https://github.com/sandros94/nuxt-surrealdb/commit/d899635))
- Set initial version ([2e7c4b3](https://github.com/sandros94/nuxt-surrealdb/commit/2e7c4b3))
- Add TODOs ([694fecb](https://github.com/sandros94/nuxt-surrealdb/commit/694fecb))
- Update playground ([f2b5ecf](https://github.com/sandros94/nuxt-surrealdb/commit/f2b5ecf))
- Add more info to package.json ([cb90540](https://github.com/sandros94/nuxt-surrealdb/commit/cb90540))
- Add funding ([be865a2](https://github.com/sandros94/nuxt-surrealdb/commit/be865a2))

#### ⚠️ Breaking Changes

- ⚠️  Use `host` instead of `url` to define db hostname ([9a777e2](https://github.com/sandros94/nuxt-surrealdb/commit/9a777e2))

### ❤️ Contributors

- Sandros94 ([@Sandros94](http://github.com/Sandros94))

