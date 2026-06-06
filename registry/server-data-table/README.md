# Server Data Table

Server-owned table mechanics for Semaphor Data Apps.

Use this item when a planned view requires server-side pagination or sorting.
The component renders public SDK result shapes and keeps the query spec visible
in the app source.

## Exports

- `ServerDataTableView`: pure table UI. Use with fixtures, fake servers, or any
  records-like result shape.
- `SemaphorServerDataTable`: thin wrapper around `useSemaphorQuery` for
  governed `semaphor.records(...)` queries.

## Boundary

This item does not infer fields, generate SQL, own authentication, or call
private Semaphor routes. Query specs still belong in the app source and should
come from the Semaphor planner or Data App SDK builders.

