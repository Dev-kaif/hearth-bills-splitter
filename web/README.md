# Hearth web app

The frontend is a React 19, TypeScript, Vite, and TanStack Router application. Install the workspace dependencies from the repository root with `pnpm install`, then start the frontend from this directory with `pnpm dev` (Vite defaults to `http://localhost:5173`).

During development, Vite forwards relative `/api` requests to `http://localhost:8787`, where the separate Hono/Cloudflare Workers API runs. Start the API from the repository root with the workspace's `pnpm dev` command. The frontend uses the Better Auth session endpoints at `/api/auth`; no API secrets or environment variables are needed in the browser.

For production, configure the Cloudflare Pages project root as `web`, use `pnpm build` as the build command, and `dist` as the build output directory. After deploying the API Worker, set a Pages runtime variable named `API_ORIGIN` to its HTTPS origin, such as `https://your-api-worker.workers.dev` (origin only, with no path). The Pages Function in `functions/api/[[path]].ts` forwards `/api` requests to that origin. It preserves the request path, query string, cookies, authorization and idempotency headers, and request body. `public/_routes.json` limits Function invocations to `/api` paths so static frontend files are served directly. Local Vite development continues to proxy `/api` to `http://localhost:8787` instead of using the Pages Function, so it works before the API is deployed.

## Verified API operations

The frontend uses the backend's confirmed contracts for:

- `POST /api/homes` with `{ name }`, returning `{ id, name }`.
- `POST /api/homes/:homeId/members` with `{ name }`, returning `{ id, homeId, name, position }`.
- `POST /api/homes/:homeId/bills` with `{ title, totalCents }`, returning `{ id, homeId, title, totalCents, shares }`.
- `POST /api/bills/:billId/shares/:shareId/pay` with an `Idempotency-Key` header.
- `GET /api/homes/:homeId/balances`, returning `{ balances: [{ memberId, name, outstandingCents }] }`.
- `GET /api/homes`, returning active homes as `{ homes: [{ id, name, createdAt }] }`.
- `GET /api/homes/:homeId`, returning `{ id, name, createdAt, archivedAt, members: [{ id, name, position, archivedAt }] }`.
- `GET /api/homes/:homeId/bills`, returning `{ bills: [{ id, title, totalCents, createdAt, shares: [{ id, memberId, memberName, amountCents, paidAt }] }] }`.

Money is entered as rupees and converted to integer paise before submission. The backend owns equal splitting and remainder distribution.

The home selector uses the first active home by default and lets the user switch between homes. Home members, bills, shares, and balances are loaded from the API through TanStack Query. Query caches are in memory only; application records are not written to localStorage.

The public landing page is available at `/`. Email/password account creation and sign-in are available at `/signup` and `/login` through the existing Better Auth client at `/api/auth`. Protected household routes require an active session and redirect signed-out users to `/login`. Sign-up proceeds to household setup; sign-in opens the dashboard.

The interface uses shadcn/ui components generated into `src/components/ui` and styled with Tailwind CSS 4. To add or update a component, run the shadcn CLI from this directory, for example `pnpm dlx shadcn@latest add alert-dialog`.

## Checks

From this directory, run `pnpm typecheck` and `pnpm build`.
