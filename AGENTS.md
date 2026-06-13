# Agent guide — Semaphor Data App Components

This repo has scoped Semaphor Data App guidance. **Follow it instead of choosing
sizes, filters, cards, or state handling ad hoc.**

1. **Before any UI change, read
   `registry/data-app-guidelines/semaphor-data-app-guidelines.md`** and
   `CLAUDE.md` when present.
2. **Build from shadcn primitives by composition.** The local
   `src/components/ui/*` files are for this gallery app. Public registry items
   should layer Semaphor behavior and dashboard styling under
   `components/semaphor/*` and depend on host shadcn primitives instead of
   overwriting a customer's Button / Select / Popover / Calendar.

The rules you must not break:

- **Type by role:** page title `text-2xl`; card title `text-base`; **picking a
  value → `text-sm`** (body, inputs, filter triggers, filter/select dropdown
  options, calendar days, data-table body cells); **triggering an action →
  `text-xs`** (buttons, dropdown-menu items, table headers, badges); eyebrows &
  counts `text-[11px]`. Nothing > 24px except the `text-3xl` hero metric.
  `tabular-nums` on every number.
- **Controls `h-8`; radius ≤ 6px** (`rounded-lg`/`md`/`sm`, never `rounded-xl`+).
- **Zinc + one brand-blue accent**; status = emerald / red only; charts use the
  blue family; **no gradients**.
- **Hairline borders, not shadows.**
- **Data views use `SemaphorQueryStateBoundary` / `QueryState`** — never
  hand-roll loading/error/empty/partial UI.
- **Generated cards use `SemaphorViewCard` / `SemaphorViewFilterBadge`** so
  users can see which active filters scope each view. App-level controls come
  from `filter-controls`; card scope comes from the generated Data App input
  contract, not label or row inference.

Tokens live in `src/index.css`; never hardcode hex / radii / shadows. If you'd
fix the same thing on a second Semaphor component, prefer a Semaphor wrapper,
variant, or scoped guideline. Only change a base primitive when the gallery's
local primitive itself is wrong; do not rely on primitive edits as the
distribution mechanism for customer apps.

Verify with `npm run typecheck && npm run build` after UI changes.
