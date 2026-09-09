# Duck Race

A multiplayer duck racing game built as a Mezon mini app. Players create rooms, add ducks, place bets, and race to win tokens. The project is a **pnpm monorepo** with a React frontend and a Node.js backend.

## Project structure

```
duck-race/
├── duckrace-fe/     # React + Vite client (duck-race-client)
├── duckrace-be/     # Express + Socket.io API (duck-race-server)
├── .env             # Shared environment variables (not committed)
├── .env.example     # Environment template
├── package.json     # Root scripts
└── pnpm-workspace.yaml
```

| Package | Stack |
|---------|-------|
| **Frontend** | React 18, Vite, Tailwind CSS, Zustand, Socket.io Client, i18next |
| **Backend** | Express, Socket.io, Prisma, PostgreSQL, Awilix DI |

### Architecture

- **PostgreSQL** — users, wallets, transaction history
- **In-memory** — rooms and active game state
- **Mezon** — authentication via init data hash verification
- **Real-time** — Socket.io for rooms, game flow, and live updates

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [PostgreSQL](https://www.postgresql.org/) (local or hosted)
- Mezon app credentials (`MEZON_APP_ID`, `MEZON_APP_TOKEN`)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Both frontend and backend read from the **root** `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_PORT` | Backend port (default `5100`) |
| `NODE_ENV` | `development` or `production` |
| `MEZON_APP_ID` | Mezon application ID |
| `MEZON_APP_TOKEN` | Mezon bot token |
| `VITE_BACKEND_URL` | Backend URL for the client (e.g. `http://localhost:5100`) |
| `VITE_MEZON_APP_ID` | Same as `MEZON_APP_ID` |
| `EXTEND_CORS` | Optional extra CORS origins |

### 3. Set up the database

```bash
pnpm db:migrate    # Create and apply migration
pnpm db:generate   # Regenerate Prisma client
```

For production:

```bash
pnpm db:deploy
```

### 4. Run development servers

From the repo root:

```bash
pnpm dev:be   # Backend → http://localhost:5100
pnpm dev:fe   # Frontend → http://localhost:5173
```

Open the app **from the Mezon client** so auth init data is available. Opening the URL directly in a browser will not authenticate.

## Scripts

All commands run from the repository root:

| Script | Description |
|--------|-------------|
| `pnpm dev:fe` | Start frontend dev server |
| `pnpm dev:be` | Start backend dev server |
| `pnpm dev:debug:be` | Backend with Node inspector |
| `pnpm build:fe` | Build frontend for production |
| `pnpm build:be` | Compile backend TypeScript |
| `pnpm start:be` | Build and run backend |
| `pnpm test:be` | Run backend tests |
| `pnpm lint:fe` | Lint frontend |
| `pnpm preview:fe` | Preview production frontend build |
| `pnpm db:migrate` | Run Prisma migrations (dev) |
| `pnpm db:deploy` | Apply migrations (production) |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |

## Mezon integration

1. User opens the mini app in Mezon → init data is passed via URL hash / WebView SDK
2. Frontend sends encoded hash to `POST /api/users/login`
3. Backend verifies the hash with `MEZON_APP_TOKEN` and issues a JWT
4. Socket.io connects after login for game events

## Local development with custom domains

If you use a local domain (e.g. `duckrace.nccsoft.test`), add it to [`duckrace-fe/vite.config.ts`](duckrace-fe/vite.config.ts):

```ts
allowedHosts: [".nccsoft.test", "localhost"],
```

Set `VITE_BACKEND_URL` and `EXTEND_CORS` to match your local setup.

## Database schema

Prisma models ([`duckrace-be/prisma/schema.prisma`](duckrace-be/prisma/schema.prisma)):

- **User** — Mezon profile, wallet balance
- **Transaction** — deposit, withdraw, and reward history

## License
MIT
