# Server Data Table

Server-owned table mechanics for Semaphor Data Apps.

Use this item when a planned view requires server-side pagination or sorting.
The component renders public SDK result shapes and keeps the query spec visible
in the app source.

## Exports

- `core.ts`: reusable mechanics for SDK column mapping, pagination metadata,
  pagination summaries, and displayed numeric totals.
- `ServerDataTableView`: pure table UI. Use with demo data, demo servers, or any
  records-like result shape.
- `SemaphorServerDataTable`: thin wrapper around `useSemaphorQuery` for
  governed `semaphor.records(...)` queries.

Use the full component when the host app uses compatible shadcn/base UI
primitives. If the host has another table/grid/design system, adapt the
`core.ts` mechanics into that presentation shell instead of replacing
server-side pagination, sorting, or totals with client-side shortcuts.

## Boundary

This item does not infer fields, generate SQL, own authentication, or call
private Semaphor routes. Query specs still belong in the app source and should
come from the Semaphor planner or Data App SDK builders.
