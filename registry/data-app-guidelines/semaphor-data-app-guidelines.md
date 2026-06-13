# Semaphor Data App Guidelines

Use these rules when building a Semaphor Data App with Semaphor's Data App SDK
and Semaphor component semantics. They are scoped to Semaphor Data App
implementation and should not replace the host app's root agent or
design-system instructions.

## Core Contract

- Generate Semaphor sources, fields, inputs, queries, and bindings from the
  accepted Data App contract. Do not hand-write parallel analytics specs.
- Keep `App.tsx` as a provider and page shell. Put repeated data-bearing views
  in `src/views`, `src/cards`, `src/sections`, or `src/components`.
- Use generated `queryOptionsForView.*(inputHandles)` or equivalent generated
  bindings so filters are applied from the contract, not inferred from labels.

## Default Semaphor Components Or Equivalent Semantics

The default starter includes Semaphor components for query state, view shells,
filters, KPIs, tables, and matrix views. They are the default starter and eval
implementation, not a required customer design system. Customer apps may
replace any visual component with their own shadcn or product components when
they preserve the same Semaphor semantics.

- Use `SemaphorViewCard` by default for generated starter/eval views, or provide
  an equivalent shell that exposes `data-semaphor-view-card` and renders query
  state plus active filter affordances.
- Use `SemaphorQueryStateBoundary` by default, or equivalent loading, error,
  empty, partial, and refreshing state semantics backed by SDK result state.
- Use `filter-controls` by default for generated apps, or equivalent controls
  backed by generated input handles and `semaphor.inputOptions(...)`.
- Use `metric-kpis`, `server-data-table`, and `matrix-table` by default for
  matching SDK result shapes. Custom components must still consume SDK results
  directly and preserve server-owned pagination, sorting, and matrix semantics.

## Filter Semantics

- A card is not "filtered" just because a filter can apply to it.
- Show card-level filter badges only for active selected filter values scoped to
  that view.
- Treat relationship keys as execution metadata. User-facing filter values
  should be business attributes unless the input is explicitly an entity picker
  with an id value and human label.
- Do not infer filter applicability from text, chart rows, or field-name
  guesses. Use generated input scope metadata.

## Visual Quality

- Keep dashboard pages quiet, dense, and scannable: concise header, visible
  filters, KPI row, charts/tables grouped by task.
- Use the host shadcn theme tokens. Do not hardcode Semaphor colors, gradients,
  shadows, or oversized marketing-style sections.
- Prefer small, consistent controls. Avoid wrapping text inside cramped filter
  triggers.

## Validation

- Run the generated app typecheck.
- Run the Semaphor Data App validator.
- Capture DevTools traces and verify that data-bearing views settle.
- When possible, select at least one filter option and confirm subscribed views
  rerun while unrelated views remain stable.
