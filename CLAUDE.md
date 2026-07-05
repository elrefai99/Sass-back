# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Modular-monolith backend for an MVP SaaS ERP platform (product branding: SwakipOS — see PM2 process names in `ecosystem.config.cjs` and worker/log strings; the README title says "Nexora ERP Backend", which is stale/inconsistent with the code). Node.js, Express 5, TypeScript (strict), MongoDB (Mongoose), Redis, BullMQ.

Package manager is **pnpm** (there's a `pnpm-lock.yaml` and `.npmrc`) — don't use npm/yarn.

## Commands

```bash
pnpm install
cp .env.example .env        # fill in real values; JWT_ACCESS_SECRET and MONGODB_URI are required or the process exits at boot (src/config/validateEnv.ts)
pnpm dev                     # API + BullMQ worker together, hot reload (concurrently + nodemon)
pnpm build                   # tsc -p tsconfig.build.json -> dist/
pnpm start                   # run compiled API + worker (production)
pnpm lint / pnpm format      # eslint . / eslint . --fix
pnpm test                    # vitest run
pnpm test:watch              # vitest watch mode
pnpm test:cov                # vitest run --coverage
```

Run a single test file: `pnpm vitest run src/utils/errors/app-error.spec.ts` (or `pnpm vitest -t "test name"` for a name match). Existing specs live next to the source file they cover (`*.spec.ts`), e.g. `src/utils/uuid.spec.ts`, `src/utils/loadKey.spec.ts`.

`NODE_ENV=test` skips `validateEnv()` and makes `getAccessSecret()` (src/shared/security.ts) fall back to a stub secret — no real env vars needed to run tests.

Docker: `docker compose up --build` brings up API, worker, MongoDB, and Redis. API listens on `PORT` (default `9999`); health check `GET /api/health`; Swagger/OpenAPI docs at `GET /api/docs` (raw spec at `/api/docs.json`); Prometheus metrics at `GET /metrics` (bearer-gated by `METRICS_TOKEN` if set).

## Architecture

**Modular monolith**: every business capability is fully self-contained under `src/module/<feature>/`. Nothing outside a module imports its internals — a module only exposes a `<feature>.module.ts` Express router (mounted once in `src/app.module.ts`), and cross-module data access goes through the shared Mongoose models in `src/schema/` rather than reaching into another module's folder.

Every module follows the same shape:

```
module/<feature>/
    feature.module.ts       # Express router + @openapi JSDoc — the only file mounted in app.module.ts
    feature.controller.ts   # barrel: re-exports every controller from Controller/
    Controller/             # one file per endpoint, zero business logic — calls a Service fn, sends response
    Service/                # all business logic and Mongoose queries live here
    DTO/index.dto.ts        # Zod schema + inferred type per request shape
    @types/index.d.ts       # module-local types
    middleware/, shared/, utils/   # only when a module genuinely needs its own
```

Modules today: `authentication`, `company`, `user`, `role`, `permission` (auth & access) · `department`, `employee`, `team` (org structure) · `project`, `task`, `task-comment` (work) · `attendance`, `notification`, `subscription`, `upload`, `profile`, `onboarding`, `dashboard` (operations) · `audit-log` (governance).

The MVP intentionally excludes Payroll, Finance, CRM, and AI. To add a module later: create the folder shape above, add any new Mongoose models under `src/schema/` (export from `src/schema/index.ts`), mount the router with one `app.use('/api/v1/<path>', newModule)` line in `src/app.module.ts`, and reuse existing middleware/shared helpers instead of duplicating pagination/filtering/response-shaping/error-handling. No existing module should need to change.

### Cross-cutting pieces (use these, don't reinvent per-module)

- `src/middleware/auth.ts` — resolves the bearer/cookie/query access token, loads the user, attaches `req.user` (id, companyId, role, permissions)
- `src/middleware/require-role.ts` — coarse-grained: `requireRole(role)` gate via `SYSTEM_ROLES` rank (`owner > admin > manager > employee`, see `src/shared/enums.ts`)
- `src/middleware/require-permission.ts` — fine-grained: `requirePermission(key)`; `owner` always passes, everyone else needs the key in `req.user.permissions` (populated from the user's custom `Role.permissionKeys`)
- `src/middleware/validateDTO.ts` — `validateDTO({ body?, query?, params? })` parses with Zod. **Note:** Express 5's `req.query` has no setter, so a validated/coerced query goes onto `req.validatedQuery`, not `req.query` — controllers must read from `req.validatedQuery` when a query schema was applied.
- `src/shared/response.ts` — `sendSuccess(res, message, data, statusCode?, meta?)`, the only success envelope shape controllers should use
- `src/shared/pagination.ts` — `parsePagination`/`buildMeta` for consistent page/pageSize/skip and response meta
- `src/shared/filter.ts` — `buildSearchFilter`/`buildDateRangeFilter` for Mongo query building
- `src/shared/activity.ts` — `writeActivity(...)` appends to the audit trail (`ActivityLogModel`)
- `src/shared/notify.ts` — `notifyUser(...)` enqueues a BullMQ notification job, with an inline-create + SSE-publish fallback if enqueueing fails
- `src/shared/security.ts` — JWT access-token sign/verify, opaque refresh-token hashing, password policy
- `src/shared/enums.ts` — every fixed-value union (`SYSTEM_ROLES`, `TASK_STATUSES`, `NOTIFICATION_TYPES`, etc.) as a `const` array + inferred type; extend here, not ad hoc in a module
- `src/utils/api-requesthandler.ts` — `asyncHandler(fn)` wraps async controllers so thrown errors reach `next()`
- `src/utils/errors/app-error.ts` — `AppError` with static factories (`.badRequest`, `.unauthorized`, `.forbidden`, `.notFound`, `.conflict`, `.unprocessable`, `.tooMany`, `.internal`); throw these from Services/Controllers instead of raw `Error`
- `src/utils/errors/errorHandler.ts` — final Express error middleware; maps `AppError`, Mongoose `ValidationError`, duplicate-key (11000), `CastError`, JWT errors to consistent JSON error responses, logs non-operational errors

### Auth & RBAC

JWT access tokens (short-lived, `ACCESS_TOKEN_TTL`, default 15m) + opaque, hashed, rotating refresh tokens with family-based reuse detection (a replayed refresh token revokes the whole session family — see `RefreshSessionModel`). Coarse-grained checks use `SYSTEM_ROLES`; fine-grained checks layer a per-company `Role`/`Permission` system on top so an admin can widen/narrow what a role can do without a code change. System roles get sane permission defaults; custom roles are fully user-defined.

### Notifications

Two delivery paths: a live SSE stream (`GET /api/v1/notifications/stream`, see `notification.module.ts`) for connected clients, and BullMQ-backed background jobs (`src/MessageQueue/notifications/`) for anything needing retry/queue semantics. `notifyUser()` in `src/shared/notify.ts` is the single entry point — call it, don't create `NotificationModel` documents or enqueue jobs directly from a module.

### Background workers (`src/MessageQueue/`)

A separate process (`src/MessageQueue/index.ts`, started alongside the API by `pnpm dev`/`pnpm start`) connects to MongoDB independently and requires in `worker.emails.ts` and `worker.notifications.ts`. Email sending uses Resend (`src/MessageQueue/emails/provider` / templates under `emails/template/`); both queues follow the same `Queue/` + `jobs/` folder split as the module pattern. In production this runs as its own PM2 app (`swakip-worker` in `ecosystem.config.cjs`), separate from the API (`swakip-api`).

### Request/response conventions

- Controllers are thin: parse via `req.validatedQuery`/`req.body`/`req.params`, call a Service function, `sendSuccess(...)` or throw an `AppError`. All business logic and Mongoose calls belong in `Service/`, not `Controller/`.
- Every route file documents itself with `@openapi` JSDoc comments consumed by `src/config/swagger.ts`; keep new endpoints documented the same way so `/api/docs` stays accurate.
- `src/types/express/index.d.ts` augments `Request` with `user` and `validatedQuery` — check it before adding another ad hoc `(req as any)` cast.
