# Matrix Table

Pivot-style matrix rendering for Semaphor Data Apps.

Use this item when a planned view uses `semaphor.matrix(...)` and the app
needs a readable cross-tab/pivot table with sticky headers, bounded height,
loading states, empty states, and error states.

The view includes hierarchy controls for row and column axes:

- Parent row headers can expand or collapse their child rows.
- Parent pivot column headers can expand or collapse their child columns when a
  subtotal/summary column remains visible.
- The matrix header rail exposes `Expand all rows` / `Collapse all rows` and
  `Expand all columns` / `Collapse all columns` affordances with matching ARIA
  labels.

## Exports

- `core.ts`: reusable mechanics for matrix result-to-grid projection, visible
  hierarchy projection, collapse state, path keys, sort state, and cell
  formatting.
- `MatrixTableView`: pure matrix UI. Use with demo data, demo servers, or SDK
  matrix grid/result payloads.
- `SemaphorMatrixTable`: thin wrapper around `useSemaphorQuery` for governed
  `semaphor.matrix(...)` queries.

Use the full component when the host app uses compatible shadcn/base UI
primitives. If the host has another table/grid/design system, adapt the
`core.ts` mechanics into that presentation shell instead of inventing sparse
cell parsing, pivot column hierarchy, subtotal, or grand-total behavior from
scratch.

## Boundary

This item renders the public Data App SDK matrix payload. It does not infer
relationships, generate matrix specs, own authentication, or call private
Semaphor routes. Query specs still belong in the app source and should come
from the Semaphor planner or Data App SDK builders.

Prefer the `grid` returned by the SDK when present. The component can derive a
basic grid from `matrixResult` for convenience, but `matrixResult` remains the
canonical governed execution payload.
