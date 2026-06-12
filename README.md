# Semaphor Data App Components

Reusable shadcn registry components for Semaphor Data Apps.

Public gallery:
https://semaphor-analytics.github.io/semaphor-data-app-components/

This repo packages complex Data App UI mechanics as inspectable source files
that can be installed into customer React apps with the shadcn CLI. The
components consume public Semaphor Data App SDK result shapes. They do not own
analytics correctness, authentication, MCP setup, query planning, SQL, or
private Semaphor routes.

Each complex table item separates mechanics from presentation:

- `core.ts` contains payload parsing, pagination/sort mapping, displayed-total
  helpers, matrix projection, collapse state helpers, and formatting utilities
  that agents can adapt to another design system.
- `index.tsx` is the thin Semaphor SDK wrapper around `useSemaphorQuery`.
- `view.tsx` is the shadcn/base UI presentation shell.

Customers can install the full component when the host app uses compatible
shadcn/base UI primitives, or use the core files as reference implementations
when adapting the table mechanics into another table/grid/design system.

## Components

- `query-state`: reusable loading, error, empty, and success states.
- `query-state-boundary`: SDK-shaped boundary for raw `useSemaphorQuery`
  results, including loading, error, empty, stale, and partial states.
- `metric-kpis`: KPI cards and multi-measure KPI helpers for Semaphor metric
  query results.
- `filter-controls`: date range, active filter summary, single-select, and
  multi-select controls for Semaphor Data App input handles.
- `server-data-table`: bounded table with server-owned pagination and sorting.
- `matrix-table`: bounded pivot/matrix table for `semaphor.matrix(...)`
  results.

## Install

From a React app that already uses shadcn and `react-semaphor`:

```bash
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/query-state-boundary
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/metric-kpis
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/filter-controls
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/server-data-table
npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/matrix-table
```

The `metric-kpis` item installs `query-state-boundary`. The
`filter-controls` item installs `date-fns` and shadcn calendar/command/popover
primitives. The `server-data-table` item installs `@tanstack/react-table` and
the `query-state` item. The `matrix-table` item installs `query-state` and
consumes the public Data App SDK matrix result/grid shape.

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

## Public Gallery Deployment

The component gallery is published as a static GitHub Pages app from this repo.
The workflow lives at `.github/workflows/deploy-gallery.yml` and deploys the
Vite `dist/` output for pushes to `main`.

GitHub Pages must be enabled for the repository with GitHub Actions as the
source. The expected public URL is:

```text
https://semaphor-analytics.github.io/semaphor-data-app-components/
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
- matrix payload projection, hierarchy collapse state, sparse cell handling,
  and subtotal/grand-total rendering guidance.

Do not use these components to infer fields, parse SQL, generate query specs,
join datasets, or bypass Semaphor governance. Query specs should remain visible
in the customer app source and flow through `react-semaphor/data-app-sdk`.
