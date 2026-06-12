# Agent guide — Semaphor Data App Components

This repo has a written design system. **Follow it instead of choosing sizes,
fonts, or spacing ad hoc.**

1. **Before any UI change, read `DESIGN.md`** (the source of truth) and
   `CLAUDE.md` (repo conventions).
2. **Build from the shared primitives** in `src/components/ui/*` — they're
   pre-tuned to the tokens. Don't rebuild a Button / Select / Popover / Calendar.

The rules you must not break (see `DESIGN.md` for the full type-scale table):

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

Tokens live in `src/index.css`; never hardcode hex / radii / shadows. If you'd
fix the same thing on a second component, fix it in the primitive or `DESIGN.md`.

Verify with `npm run typecheck && npm run build` after UI changes.
