# Filmes para ver (filmes-para-ver)

## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
pnpm run lint
# or: yarn/npm/bun run lint
```

...or just check formatting & linting:

```bash
pnpm run lint:check
# or: yarn/npm/bun run lint:check
```

### Build the app for production

```bash
quasar build
```

### Configure the TMDB API

Copy `.env.example` to `.env` and set `QCLI_TMDB_ACCESS_TOKEN` to your TMDB API Read Access Token. Restart the development server after changing environment variables.

This is a client-side application, so the token is included in the browser bundle and is publicly inspectable. Do not use a token that must remain confidential.

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).
