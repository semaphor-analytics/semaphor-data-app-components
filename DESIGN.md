# Design System — Semaphor Data App Components

> The conventions every component in this gallery follows. **Read this before
> adding or changing any UI.** It exists so we never again hand-tune a font size,
> control height, or radius one component at a time.
>
> Upstream authority: `semaphor-app/brand/BRAND.md` (zinc ramp, brand blue,
> 6px radius cap, Open Sans, hairlines, one accent). This document applies that
> brand at the **dense, analytics-product density** this surface uses. If this
> doc and BRAND.md ever conflict, BRAND.md wins.

## How consistency is enforced — three tiers

1. **Primitives are the host substrate.** Everything in `src/components/ui/*`
   (Button, Card, Input, Select, Command, Calendar, Badge, Tabs, Tooltip, …)
   is the local gallery's shadcn layer. Public registry components compose those
   primitives, but Semaphor-specific dashboard opinions belong under
   `components/semaphor/*`. Customer apps may bring their own shadcn preset and
   primitive styling; do not require primitive overwrites to get correct
   Semaphor behavior.
2. **Design tokens live in `src/index.css`.** Color, the radius ramp (capped at
   6px), and the font family. Never hardcode a hex color, radius, or shadow —
   reach for the CSS variable / Tailwind token.
3. **This doc + the pre-commit checklist** cover the rest: the type scale and
   spacing for **custom markup** (charts, KPI numbers, bespoke layouts) where no
   primitive exists.

## Type scale — the #1 source of drift

Open Sans everywhere. `tabular-nums` on **every** number. Each role maps to one
class — pick by role, never eyeball a size:

| Role | Class | px |
|---|---|---|
| Page / dashboard title | `text-2xl font-semibold tracking-tight` | 24 |
| Primary metric value (KPI) | `text-3xl font-semibold tabular-nums` | 30 |
| Secondary metric value | `text-2xl font-semibold tabular-nums` | 24 |
| Card title | `text-base font-medium` | 16 |
| Body / description | `text-sm text-muted-foreground leading-6` | 14 |
| **Value control** (input, filter trigger) | `text-sm` | 14 |
| **Value-selection list** (filter dropdown option, select option, date preset, calendar day) | `text-sm` | 14 |
| Data table — body / footer cell | `text-sm tabular-nums` | 14 |
| Data table — header cell | `text-xs font-medium` | 12 |
| **Action / command menu** (button, dropdown-menu item, table header, badge, calendar weekday) | `text-xs` | 12 |
| Eyebrow / KPI label / nav group heading | `text-[11px] font-medium uppercase tracking-wider text-muted-foreground` | 11 |
| Micro (counts, footers, scope chips, %) | `text-[11px]` | 11 |

Rules:
- **Nothing larger than 24px** on this surface (the brand product cap). The only
  exception is the `text-3xl` hero metric value.
- The one distinction worth memorizing: **picking a value → `text-sm` (14);
  triggering an action → `text-xs` (12).** A filter/select dropdown option, a
  date, and a data-table body cell are all 14 — the value reads the same size in
  the list as in the trigger that displays it. A button, a dropdown-menu action,
  and a table header are 12.
- If you reach for `text-lg` / `text-xl`, stop — map it to the nearest role.

## Controls

- **Height: `h-8` (32px) is the standard** for every control — button, input,
  select, filter trigger, segmented toggle. `h-7` for the `sm` size. One height;
  don't mix `h-9`/`h-10` into the same bar.
- **Radius (brand cap = 6px):** `rounded-lg` (6) for cards/popovers/dialogs,
  `rounded-md` (5) for controls, `rounded-sm` (4) for chips/badges. **Never**
  `rounded-xl` or larger. `rounded-full` only for avatars / status dots.
- Reuse the host primitive — don't rebuild a Select, Popover, Command, or
  Calendar. Put Semaphor-specific density and affordances in the Semaphor
  wrapper/component that composes the primitive.

## Color

- **Monochrome zinc + one brand-blue accent** (`text-brand` / `bg-brand` /
  `var(--brand)`). One chromatic "moment" per screen.
- **Status colors only:** emerald (success / positive delta), red /
  `destructive` (error / negative delta). No teal, indigo, amber — distinguish
  with weight or type, not a new hue.
- **Charts use the blue family only** (`--chart-1`…`--chart-5`). No rainbow
  palettes. **No gradients** — flat fills at low opacity are fine (e.g. an area
  chart fill at `fillOpacity 0.1`).

## Elevation, spacing, density

- **Hairlines over shadows.** Containment is `border border-border`. Shadows only
  on floating layers (popover / dropdown / tooltip).
- Card padding `p-4`–`p-5`; grids `gap-4`; page sections `gap-5`–`gap-6`.
- **Dashboards run full-width** — no `max-w` wrapper. Reading surfaces
  (component detail, docs) center at `max-w-6xl`.

## Data states — never hand-roll

Every data-backed view goes through `SemaphorQueryStateBoundary` (SDK-shaped) or
`QueryState` (presentation-only). Do **not** invent per-component loading/error
markup.

- **Loading and refreshing render the same skeleton** (`DefaultLoadingState`) —
  a content-shaped pulse. No dim-and-overlay treatment.
- **Error → compact, centered**: tinted icon circle + short title + message +
  optional retry. Not a full-width alert.
- **Empty → compact, centered**: inbox icon + short message.
- **Partial → a small `Partial` badge** above the content. No alert box.

## Filter affordance

Generated dashboards use two visible filter layers:

- app-level controls from `filter-controls` for the actual input handles;
- per-card scope cues from `SemaphorViewCard` / `SemaphorViewFilterBadge`.

Do not infer scope from prose, labels, or chart rows. Pass active filter
summaries and view scope from the generated Semaphor Data App input contract.
Charts, KPI cards, analysis cards, table cards, and matrix cards should sit
inside `SemaphorViewCard` unless the component already provides an equivalent
Semaphor shell.

## Before you commit — checklist

- [ ] Reused a shared primitive wherever one exists.
- [ ] Every font size maps to a **role** in the type scale (no stray `text-lg`).
- [ ] Controls are `h-8`; radius is ≤ 6px (`rounded-lg`/`md`/`sm`).
- [ ] One accent on the screen; every number is `tabular-nums`; status colors
      are only emerald / red.
- [ ] Containment is a hairline border, not a shadow.
- [ ] Charts use the blue family; no gradients, no extra hues.
- [ ] Any data view is wrapped in a query-state boundary.
- [ ] Generated dashboard cards show filter scope with `SemaphorViewCard` or
      `SemaphorViewFilterBadge`.

## Changing a token

Because the rules live in the primitives + `index.css` + this doc, a global
change is a **one-place** edit, not a sweep:

- Control font/height → first prefer the Semaphor wrapper/component that owns
  the dashboard use case. Change `src/components/ui/*` only for this gallery's
  local primitive behavior, not as a customer distribution mechanism.
- Radius / color / font family → `src/index.css`.
- A scale or rule → this doc (and the primitive that embodies it).

If you find yourself fixing the same kind of thing on a second component, the
fix belongs in the primitive or this doc — not the component.
