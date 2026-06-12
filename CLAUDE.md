# Semaphor Data App Components

Reusable **shadcn-registry** components for Semaphor Data Apps, plus a public
gallery that showcases them. Customers install pieces into their own React apps
with the shadcn CLI; the gallery (`src/gallery/*`) is how they preview the look
and feel.

## Design system — read before ANY UI change

**`DESIGN.md` is the source of truth for sizing, type, color, radius, and
density.** Read it before adding or editing UI. It exists specifically so we
never hand-tune a font size or control height one component at a time.

The non-negotiables (full detail + the type scale table in `DESIGN.md`):

- **Use the shared primitives** in `src/components/ui/*` — they're pre-tuned to
  the tokens. Don't rebuild a Button / Select / Popover / Calendar / Command.
- **Type scale by role, not by eye.** Page title `text-2xl`; card title
  `text-base`; **picking a value → `text-sm` (14px)** — body, inputs, filter
  triggers, filter/select dropdown options, calendar days, data-table body
  cells; **triggering an action → `text-xs` (12px)** — buttons, dropdown-menu
  items, table headers, badges; eyebrows/counts `text-[11px]`. Nothing > 24px
  except the `text-3xl` hero metric. `tabular-nums` on every number.
- **Controls are `h-8`. Radius caps at 6px** (`rounded-lg`/`md`/`sm`; never
  `rounded-xl`+).
- **Monochrome zinc + one brand-blue accent** (`text-brand`/`bg-brand`). Status
  = emerald / red only. Charts use the blue family. No gradients, no extra hues.
- **Hairline borders over shadows.**
- **Data views go through `SemaphorQueryStateBoundary` / `QueryState`** — loading
  & refreshing share one skeleton; error/empty are compact centered; partial is
  a small badge. Never hand-roll state UI.

If you're about to fix the same styling thing on a second component, the fix
belongs in the primitive or `DESIGN.md`, not the component. Tokens live in
`src/index.css` (color, 6px radius ramp, Open Sans) — never hardcode hex /
radii / shadows.

Upstream brand authority: `semaphor-app/brand/BRAND.md` (cross-surface). When it
conflicts with `DESIGN.md`, BRAND.md wins.

## Layout

- `registry/*` — the installable components. Each complex item splits
  `core.ts` (mechanics) / `index.tsx` (SDK wrapper) / `view.tsx` (presentation).
  These are shipped source — keep mechanics intact; visual changes still follow
  `DESIGN.md`.
- `src/components/ui/*` — shadcn primitives, dense-tuned (the design-system
  defaults live here).
- `src/gallery/*` — the showcase app (sidebar shell, component detail, dashboard
  samples). Not shipped to customers; free to restyle.
- `src/index.css` — design tokens (zinc ramp, `--brand`, radius ramp, Open Sans).

## Commands

```bash
npm run dev        # Vite gallery (demo data, no Semaphor token needed)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # tsc -b && vite build  (stricter than typecheck)
```

After UI work, run `typecheck` + `build`, and spot-check the gallery in the
browser in both light and dark.
