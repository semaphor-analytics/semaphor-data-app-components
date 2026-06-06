# Semaphor Data App Components

Reusable shadcn registry components for Semaphor Data Apps.

This repo packages complex Data App UI mechanics as inspectable source files
that can be installed into customer React apps with the shadcn CLI. The
components consume public Semaphor Data App SDK result shapes. They do not own
analytics correctness, authentication, MCP setup, query planning, SQL, or
private Semaphor routes.

## Components

- `query-state`: reusable loading, error, empty, and success states.
- `server-data-table`: bounded table with server-owned pagination and sorting.
- `matrix-table`: bounded pivot/matrix table for `semaphor.matrix(...)`
  results.

## Install

From a React app that already uses shadcn and `react-semaphor`:

```bash
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/server-data-table
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/matrix-table
```

The `server-data-table` item installs `@tanstack/react-table` and the
`query-state` item. The `matrix-table` item installs `query-state` and consumes
the public Data App SDK matrix result/grid shape.

## Local Development

Use Node `20.19+` or `22.12+`. This repo includes `.nvmrc` for local
development.

```bash
nvm use
npm install
npm run dev
```

The local app is a fixture-backed component gallery. It does not require a
Semaphor project token or local Semaphor server.

Useful checks:

```bash
npm run typecheck
npm run build
npx shadcn@latest build
```

After the GitHub repo is public, validate the registry with:

```bash
npx shadcn@latest registry validate semaphor-analytics/semaphor-data-app-components
```

## Architecture Boundary

Use these components for UI mechanics:

- table height and scrolling;
- sticky headers;
- server pagination controls;
- server sorting controls;
- loading, error, and empty states;
- numeric alignment and displayed totals.
- matrix/pivot grid rendering for governed matrix query results.

Do not use these components to infer fields, parse SQL, generate query specs,
join datasets, or bypass Semaphor governance. Query specs should remain visible
in the customer app source and flow through `react-semaphor/data-app-sdk`.
