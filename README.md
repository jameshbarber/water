## Water Hub
Water is a lightweight hub for controlling devices and collecting readings on a local network (e.g. a Raspberry Pi). It supports multiple device protocols and exposes both REST and MCP interfaces, plus a typed SDK.

### Features
- **Schema-driven modules** with CRUD out of the box
- **Multiple stores**: JSON, CSV, Drizzle, Postgres
- **REST API** with generated OpenAPI docs
- **MCP server** mirroring REST routes as tools
- **Event-driven** module lifecycle (created/updated events)

### Architecture
- **App + Manifest**: The app is created from a manifest in `src/config.ts` describing interfaces, store, and modules.
- **Modules**: Each module defines schemas and gets CRUD routes automatically. Built-in modules:
  - `devices`, `commands`, `triggers`, `readings`, `settings`
- **Dependencies (Deps)**: Wired in `src/deps.ts`
  - Logger: `ConsoleLogger`
  - Event bus: `SimpleEventBus`
  - Database: `JsonDatabase` | `CsvDatabase` | `DrizzleDatabase` | `PostgresDatabase`
  - REST server: `ExpressServerAdapter` + `OpenAPIDocGenerator`
  - MCP: `McpServer`

### Interfaces
- **REST**
  - Base URL comes from the manifest `interfaces.rest` host/port. The default example in `src/config.ts` is `http://192.168.1.50:4000`.
  - Generated CRUD routes per module:
    - `GET /{module}` – list
    - `GET /{module}/{id}` – read
    - `POST /{module}` – create
    - `PUT /{module}/{id}` – update
    - `DELETE /{module}/{id}` – delete
  - **OpenAPI schema**: `GET /docs/rest`
  - **Settings & manifest** (via `settings` module):
    - `GET /settings`, `PUT /settings`
    - `GET /manifest`, `PUT /manifest` (emits `settings.manifest.updated`)

- **MCP**
  - Endpoints: `POST /mcp` (HTTP transport) and `GET /mcp` (SSE stream)
  - All REST routes are exposed as MCP tools with input schemas derived from zod where available

### Storage
- Configure the store in `src/config.ts` under `manifest.store`:
  - `type`: `"json" | "csv" | "drizzle" | "postgres"`
  - `url`: path (for json/csv) or connection string (for postgres)
- If no store is specified, the app defaults to JSON at `data.json`.
- For Postgres/Drizzle:
  - Set `DATABASE_URL` in `.env`
  - Migrations and tooling:
    - `pnpm drizzle:generate`
    - `pnpm drizzle:migrate`
    - `pnpm drizzle:studio`

#### DATABASE_URL in .env
- **Required when using `drizzle`** (runtime client and Drizzle tooling read `DATABASE_URL`).
- **Recommended for `postgres`**: set `manifest.store.url` to `process.env.DATABASE_URL` in `src/config.ts`.

Add an `.env` file at the repo root:

```env
# Local example (no SSL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/water

# If your provider requires SSL, append a mode parameter (provider-specific):
# DATABASE_URL=postgresql://USER:PASS@HOST:5432/DB?sslmode=require
```

If you use the `postgres` store type instead of `drizzle`, point the store to the same env var:

```ts
// src/config.ts
"store": {
  "type": "postgres",
  "url": process.env.DATABASE_URL as string
}
```

Notes:
- Protocol may be `postgres://` or `postgresql://`.
- Ensure the database (`water` above) exists before running migrations.
- Drizzle CLI uses the same `DATABASE_URL` defined in `drizzle.config.ts`.

### Running locally
1. Install deps: `pnpm install`
2. Configure `src/config.ts`:
   - Set `interfaces.rest.host` and `port` as needed (e.g. `0.0.0.0` and `4000` for LAN)
   - Choose a `store` and, if `drizzle`/`postgres`, set `.env` with `DATABASE_URL`
3. Start: `pnpm dev`
   - Server starts at `http://<host>:<port>`
   - OpenAPI schema at `/docs/rest`
4. Tests: `pnpm test:unit`

### SDK
The SDK lives in `packages/sdk` and is generated from the live OpenAPI schema.

- Generate schema + types: `pnpm sdk:generate` (writes `packages/sdk/openapi.json` and `packages/sdk/src/types.ts`)
- Build SDK: `pnpm sdk:build`
- Example usage:

```ts
import { createSdkClient } from '@add-water/sdk';

const api = createSdkClient({ baseUrl: 'http://192.168.1.50:4000' });

// List devices
const devices = await api.GET('/devices');

// Create a device
await api.POST('/devices', { body: { id: 'dev1', driver: 'http' } });
```

### Project layout
- `src/adapters`
  - `database`: JSON/CSV/Drizzle/Postgres implementations
  - `drivers`: MQTT and HTTP drivers
  - `logging`: console logger
  - `rest`: Express server, router, and OpenAPI doc generator
  - `mcp`: HTTP transport exposing REST as MCP tools
- `src/core`
  - `modules`: base `Module` with CRUD and events
  - `dependencies`: contracts and interfaces
- `src/modules`: business modules and schemas (zod)
- `src/subscribers`: event listeners
- `src/index.ts`: `createApp` factory and registration
- `src/config.ts`: app manifest
- Root `index.ts`: boots the app in dev

### Adding a new module (quick start)
1. Create a folder in `src/modules/<name>` and define `schema.ts` using zod.
2. Add it to `src/config.ts` under `manifest.modules` (optionally provide a custom constructor).
3. Optionally add custom routes with `module.addRoute({ path, method, handler })`.

### Useful scripts
- `pnpm dev` – start the hub (ts-node)
- `pnpm test:unit` – run unit tests
- `pnpm post:readings` – post sample readings
- `pnpm sdk:generate` / `pnpm sdk:build` – generate and build the SDK
- `pnpm drizzle:*` – migration/studio tooling
