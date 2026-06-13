import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  DatabaseIcon,
  FilterIcon,
  Grid3X3Icon,
  LayoutDashboardIcon,
  LayersIcon,
  LineChartIcon,
  MonitorIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SearchIcon,
  SunIcon,
  Table2Icon,
  TerminalIcon,
  type LucideIcon,
} from "lucide-react"
import type { SemaphorInputHandle } from "react-semaphor/data-app-sdk"

import { SemaphorIcon } from "@/components/semaphor-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/components/theme-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { QueryState } from "../../registry/query-state/query-state"
import { SemaphorMetricKpiCard, SemaphorMultiMeasureKpis } from "../../registry/metric-kpis"
import {
  SemaphorActiveFilterSummaryBadge,
  SemaphorDateRangeFilter,
  SemaphorMultiSelectFilter,
  SemaphorSingleSelectFilter,
  getSemaphorActiveFilterSummaries,
} from "../../registry/filter-controls"
import { SemaphorQueryStateBoundary } from "../../registry/query-state-boundary"
import {
  SemaphorViewCard,
  SemaphorViewFilterBadge,
  type SemaphorViewFilterSummary,
} from "../../registry/view-card"
import {
  ServerDataTableBasicExample,
  type ServerTableExampleControls,
} from "./examples/server-data-table-basic"
import {
  MatrixTableBasicExample,
  type MatrixTableExampleControls,
} from "./examples/matrix-table-basic"
import {
  dashboardSamples,
  type DashboardSampleId,
} from "./samples/dashboard-samples"
import { MiniAreaChart } from "./samples/composed-samples"

type RegistryItemId =
  | "query-state-boundary"
  | "view-card"
  | "metric-kpis"
  | "filter-controls"
  | "server-data-table"
  | "matrix-table"
  | "query-state"

type RegistryCategory = "State" | "Metrics" | "Inputs" | "Tables"

type RegistryItem = {
  id: RegistryItemId
  title: string
  category: RegistryCategory
  icon: LucideIcon
  summary: string
  bestFor: string
  installs: string[]
  dependencies: string[]
}

const CATEGORY_ORDER: RegistryCategory[] = [
  "Metrics",
  "Inputs",
  "Tables",
  "State",
]

const registryItems: RegistryItem[] = [
  {
    id: "metric-kpis",
    title: "Metric KPIs",
    category: "Metrics",
    icon: LineChartIcon,
    summary:
      "KPI cards for primary metric values, comparison badges, sparklines, and multi-measure metric maps.",
    bestFor: "Executive summaries, scorecards, and compact metric rows.",
    installs: ["metric-kpis"],
    dependencies: ["query-state-boundary", "badge", "card"],
  },
  {
    id: "filter-controls",
    title: "Filter Controls",
    category: "Inputs",
    icon: FilterIcon,
    summary:
      "Date range, single-select, multi-select, and active-filter summary controls for Semaphor input handles.",
    bestFor: "Generated apps with customer-facing filter bars.",
    installs: ["filter-controls"],
    dependencies: ["badge", "button", "calendar", "command", "popover", "date-fns"],
  },
  {
    id: "server-data-table",
    title: "Server Data Table",
    category: "Tables",
    icon: Table2Icon,
    summary:
      "Server-paginated, server-sortable records table with bounded height, totals, density, and column visibility.",
    bestFor: "Large records results that should stay server-driven.",
    installs: ["server-data-table"],
    dependencies: ["query-state", "@tanstack/react-table", "badge", "button", "table"],
  },
  {
    id: "matrix-table",
    title: "Matrix Table",
    category: "Tables",
    icon: Grid3X3Icon,
    summary:
      "Sticky-header matrix table for Semaphor matrix query projections with expandable row and column axes.",
    bestFor: "Pivot-style BI views with row and column dimensions.",
    installs: ["matrix-table"],
    dependencies: ["query-state", "button", "table"],
  },
  {
    id: "view-card",
    title: "View Card",
    category: "State",
    icon: LayersIcon,
    summary:
      "Card shell for SDK-backed views with title, query state, and per-card filter scope affordances.",
    bestFor: "Generated KPI, chart, analysis, table, and matrix views.",
    installs: ["view-card"],
    dependencies: ["query-state-boundary", "badge", "card", "tooltip"],
  },
  {
    id: "query-state-boundary",
    title: "Query State Boundary",
    category: "State",
    icon: AlertCircleIcon,
    summary:
      "Wrap a raw useSemaphorQuery result and render loading, empty, partial, stale, and error states consistently.",
    bestFor: "Every SDK-backed view that needs production query states.",
    installs: ["query-state-boundary"],
    dependencies: ["alert", "badge", "button", "skeleton"],
  },
  {
    id: "query-state",
    title: "Query State",
    category: "State",
    icon: DatabaseIcon,
    summary:
      "Presentation-only loading, error, empty, and success states used by table and matrix primitives.",
    bestFor: "Custom data views that are not using the SDK-shaped boundary.",
    installs: ["query-state"],
    dependencies: ["alert", "button", "skeleton"],
  },
]

type Selection =
  | { kind: "dashboard"; id: DashboardSampleId }
  | { kind: "component"; id: RegistryItemId }

export function ComponentGallery() {
  const [selection, setSelection] = useState<Selection>({
    kind: "dashboard",
    id: "executive",
  })
  const [search, setSearch] = useState("")
  const [serverControls, setServerControls] = useState<ServerTableExampleControls>({
    pageSize: 25,
    latencyMs: 250,
    errorMode: "none",
    totalRowCount: 240,
  })
  const [matrixControls, setMatrixControls] = useState<MatrixTableExampleControls>({
    latencyMs: 250,
    errorMode: "none",
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeDashboard =
    selection.kind === "dashboard"
      ? dashboardSamples.find((sample) => sample.id === selection.id) ??
        dashboardSamples[0]
      : null
  const activeComponent =
    selection.kind === "component"
      ? registryItems.find((item) => item.id === selection.id) ??
        registryItems[0]
      : null

  const breadcrumbSection =
    selection.kind === "dashboard" ? "Dashboards" : "Components"
  const breadcrumbTitle = activeDashboard?.title ?? activeComponent?.title ?? ""

  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      <GallerySidebar
        open={sidebarOpen}
        selection={selection}
        onSelect={setSelection}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-5 backdrop-blur-sm lg:px-10">
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 hidden lg:inline-flex"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setSidebarOpen((value) => !value)}
          >
            {sidebarOpen ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
          </Button>
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden text-muted-foreground sm:inline">
              {breadcrumbSection}
            </span>
            <ChevronRightIcon className="hidden size-3.5 text-muted-foreground/50 sm:inline" />
            <span className="truncate font-medium text-foreground">
              {breadcrumbTitle}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <MobileNavSelect selection={selection} onSelect={setSelection} />
            <ThemeSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "w-full px-5 py-6 lg:py-8",
              activeDashboard
                ? "lg:px-8"
                : "mx-auto max-w-6xl lg:px-10",
            )}
          >
            {activeDashboard ? (
              <DashboardCanvas sample={activeDashboard} />
            ) : activeComponent ? (
              <ComponentDetail
                item={activeComponent}
                serverControls={serverControls}
                setServerControls={setServerControls}
                matrixControls={matrixControls}
                setMatrixControls={setMatrixControls}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sidebar + navigation                                               */
/* ------------------------------------------------------------------ */

function GallerySidebar({
  open,
  selection,
  onSelect,
  search,
  onSearchChange,
}: {
  open: boolean
  selection: Selection
  onSelect: (next: Selection) => void
  search: string
  onSearchChange: (next: string) => void
}) {
  const query = search.trim().toLowerCase()
  const matches = (text: string) => !query || text.toLowerCase().includes(query)

  const dashboardMatches = dashboardSamples.filter((sample) =>
    matches(sample.title),
  )
  const componentGroups = CATEGORY_ORDER.map((category) => ({
    category,
    items: registryItems.filter(
      (item) => item.category === category && matches(item.title),
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar",
        open ? "lg:flex" : "lg:hidden",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
        <SemaphorIcon className="size-5 text-brand" />
        <span className="text-sm font-semibold tracking-wide">Semaphor</span>
        <Badge variant="secondary" className="ml-auto text-[10px] tracking-wide">
          Registry
        </Badge>
      </div>

      <div className="px-3 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search components"
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <NavGroup icon={LayoutDashboardIcon} label="Dashboards">
          {dashboardMatches.map((sample) => (
            <NavItem
              key={sample.id}
              icon={sample.icon}
              label={sample.title}
              active={
                selection.kind === "dashboard" && selection.id === sample.id
              }
              onClick={() => onSelect({ kind: "dashboard", id: sample.id })}
            />
          ))}
        </NavGroup>

        {componentGroups.map((group) => (
          <NavGroup key={group.category} label={group.category}>
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.title}
                active={
                  selection.kind === "component" && selection.id === item.id
                }
                onClick={() => onSelect({ kind: "component", id: item.id })}
              />
            ))}
          </NavGroup>
        ))}

        {dashboardMatches.length === 0 && componentGroups.length === 0 ? (
          <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">
            No components match “{search}”.
          </p>
        ) : null}
      </nav>
    </aside>
  )
}

function NavGroup({
  icon: Icon,
  label,
  children,
}: {
  icon?: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 px-2.5 pt-3 pb-1.5 text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active
            ? "text-brand"
            : "text-muted-foreground/70 group-hover:text-foreground",
        )}
      />
      <span className="truncate">{label}</span>
    </button>
  )
}

function MobileNavSelect({
  selection,
  onSelect,
}: {
  selection: Selection
  onSelect: (next: Selection) => void
}) {
  const value = `${selection.kind}:${selection.id}`

  return (
    <div className="lg:hidden">
      <Select
        value={value}
        onValueChange={(next) => {
          if (!next) return
          const [kind, id] = next.split(":")
          if (kind === "dashboard") {
            onSelect({ kind: "dashboard", id: id as DashboardSampleId })
          } else {
            onSelect({ kind: "component", id: id as RegistryItemId })
          }
        }}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Dashboards</SelectLabel>
            {dashboardSamples.map((sample) => (
              <SelectItem key={sample.id} value={`dashboard:${sample.id}`}>
                {sample.title}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Components</SelectLabel>
            {registryItems.map((item) => (
              <SelectItem key={item.id} value={`component:${item.id}`}>
                {item.title}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const options = [
    { value: "light" as const, label: "Light", icon: SunIcon },
    { value: "system" as const, label: "System", icon: MonitorIcon },
    { value: "dark" as const, label: "Dark", icon: MoonIcon },
  ]

  return (
    <div
      className="flex h-8 items-center gap-0.5 rounded-md border border-border bg-muted/60 p-0.5"
      role="group"
      aria-label="Theme"
    >
      {options.map((option) => {
        const Icon = option.icon
        const selected = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-sm transition-colors",
              selected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label={`Use ${option.label.toLowerCase()} theme`}
            aria-pressed={selected}
            title={option.label}
            onClick={() => setTheme(option.value)}
          >
            <Icon className="size-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dashboard canvas                                                   */
/* ------------------------------------------------------------------ */

function DashboardCanvas({
  sample,
}: {
  sample: (typeof dashboardSamples)[number]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          {sample.eyebrow}
        </Badge>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {sample.heading}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {sample.description}
          </p>
        </div>
      </div>

      {sample.bleed ? (
        sample.render()
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-4 lg:p-5 dark:bg-muted/20">
          {sample.render()}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Component detail                                                   */
/* ------------------------------------------------------------------ */

function ComponentDetail({
  item,
  serverControls,
  setServerControls,
  matrixControls,
  setMatrixControls,
}: {
  item: RegistryItem
  serverControls: ServerTableExampleControls
  setServerControls: Dispatch<SetStateAction<ServerTableExampleControls>>
  matrixControls: MatrixTableExampleControls
  setMatrixControls: Dispatch<SetStateAction<MatrixTableExampleControls>>
}) {
  const Icon = item.icon

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card">
            <Icon className="size-5 text-brand" />
          </span>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {item.title}
              </h1>
              <Badge variant="secondary">{item.category}</Badge>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {item.summary}
            </p>
          </div>
        </div>

        <InstallCommand item={item} />
      </div>

      <Tabs defaultValue="preview" className="flex flex-col gap-5">
        <TabsList variant="line" className="w-fit">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <PreviewStage>
            {renderPreview({
              item,
              serverControls,
              setServerControls,
              matrixControls,
              setMatrixControls,
            })}
          </PreviewStage>
        </TabsContent>

        <TabsContent value="details">
          <DetailsPanel item={item} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InstallCommand({ item }: { item: RegistryItem }) {
  const command = item.installs
    .map(
      (name) =>
        `npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/${name}`,
    )
    .join("\n")
  const [copied, setCopied] = useState(false)

  const copy = () => {
    void navigator.clipboard?.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
      <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap text-foreground/90">
        {command}
      </code>
      <Button variant="ghost" size="sm" onClick={copy} aria-label="Copy install command">
        {copied ? (
          <CheckIcon className="text-success" data-icon="inline-start" />
        ) : (
          <CopyIcon data-icon="inline-start" />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}

function PreviewStage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 lg:p-6 dark:bg-muted/20">
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Previews                                                           */
/* ------------------------------------------------------------------ */

function renderPreview({
  item,
  serverControls,
  setServerControls,
  matrixControls,
  setMatrixControls,
}: {
  item: RegistryItem
  serverControls: ServerTableExampleControls
  setServerControls: Dispatch<SetStateAction<ServerTableExampleControls>>
  matrixControls: MatrixTableExampleControls
  setMatrixControls: Dispatch<SetStateAction<MatrixTableExampleControls>>
}) {
  switch (item.id) {
    case "server-data-table":
      return (
        <ServerDataTablePreview
          controls={serverControls}
          setControls={setServerControls}
        />
      )
    case "matrix-table":
      return (
        <MatrixTablePreview
          controls={matrixControls}
          setControls={setMatrixControls}
        />
      )
    case "metric-kpis":
      return <MetricKpisPreview />
    case "filter-controls":
      return <FilterControlsPreview />
    case "view-card":
      return <ViewCardPreview />
    case "query-state":
      return <QueryStatePreview />
    case "query-state-boundary":
    default:
      return <QueryStateBoundaryPreview />
  }
}

function ServerDataTablePreview({
  controls,
  setControls,
}: {
  controls: ServerTableExampleControls
  setControls: Dispatch<SetStateAction<ServerTableExampleControls>>
}) {
  return (
    <div className="flex flex-col gap-4">
      <PreviewControlsCard
        description="Adjust the demo server response to inspect pagination, sorting, loading, errors, and empty states."
        columns="md:grid-cols-4"
      >
        <ControlSelect
          label="Page size"
          value={String(controls.pageSize)}
          options={["10", "25", "50", "100"]}
          onValueChange={(value) =>
            setControls((current) => ({ ...current, pageSize: Number(value) }))
          }
        />
        <ControlSelect
          label="Latency"
          value={String(controls.latencyMs)}
          options={["0", "250", "800", "1600"]}
          onValueChange={(value) =>
            setControls((current) => ({ ...current, latencyMs: Number(value) }))
          }
        />
        <ControlSelect
          label="Error mode"
          value={controls.errorMode}
          options={["none", "network", "server"]}
          onValueChange={(value) =>
            setControls((current) => ({
              ...current,
              errorMode: value as ServerTableExampleControls["errorMode"],
            }))
          }
        />
        <ControlSelect
          label="Total rows"
          value={String(controls.totalRowCount)}
          options={["0", "24", "240"]}
          onValueChange={(value) =>
            setControls((current) => ({
              ...current,
              totalRowCount: Number(value),
            }))
          }
        />
      </PreviewControlsCard>
      <ServerDataTableBasicExample
        {...controls}
        onPageSizeChange={(pageSize) =>
          setControls((current) => ({ ...current, pageSize }))
        }
      />
    </div>
  )
}

function MatrixTablePreview({
  controls,
  setControls,
}: {
  controls: MatrixTableExampleControls
  setControls: Dispatch<SetStateAction<MatrixTableExampleControls>>
}) {
  return (
    <div className="flex flex-col gap-4">
      <PreviewControlsCard
        description="Adjust the demo matrix response to inspect loading and failure states."
        columns="md:grid-cols-2"
      >
        <ControlSelect
          label="Latency"
          value={String(controls.latencyMs)}
          options={["0", "250", "800", "1600"]}
          onValueChange={(value) =>
            setControls((current) => ({ ...current, latencyMs: Number(value) }))
          }
        />
        <ControlSelect
          label="Error mode"
          value={controls.errorMode}
          options={["none", "network", "server"]}
          onValueChange={(value) =>
            setControls((current) => ({
              ...current,
              errorMode: value as MatrixTableExampleControls["errorMode"],
            }))
          }
        />
      </PreviewControlsCard>
      <MatrixTableBasicExample {...controls} />
    </div>
  )
}

function MetricKpisPreview() {
  const metricResult = {
    status: "success" as const,
    value: 842500,
    deltaPercent: 12.4,
    measures: {
      revenue: 842500,
      orders: 3241,
      conversion_rate: 18.6,
    },
  }

  const previewScope: SemaphorViewFilterSummary[] = [
    { id: "order_date", label: "Order date", value: "Last 6 months" },
    { id: "region", label: "Region", value: "North" },
    { id: "segment", label: "Segment", value: "2 selected" },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <SemaphorMetricKpiCard
        result={metricResult}
        label="Revenue"
        description="Primary SDK metric value"
        format="currency-compact"
        trend={[612000, 668000, 705000, 742000, 798000, 842500]}
        headerAccessory={<SemaphorViewFilterBadge compact filters={previewScope} />}
      />
      <SemaphorMultiMeasureKpis
        result={metricResult}
        title="Performance summary"
        description="Secondary measures render from result.measures without reusing the primary comparison badge."
        headerAccessory={<SemaphorViewFilterBadge compact filters={previewScope} />}
        measures={[
          {
            key: "revenue",
            label: "Revenue",
            format: "currency-compact",
            delta: 12.4,
          },
          { key: "orders", label: "Orders", format: "number", delta: 8.1 },
          {
            key: "conversion_rate",
            label: "Conversion",
            format: "percent",
            delta: -1.2,
          },
        ]}
      />
    </div>
  )
}

function ViewCardPreview() {
  const filters: SemaphorViewFilterSummary[] = [
    { id: "order_date", label: "Order date", value: "Last 6 months" },
    { id: "region", label: "Region", value: "North" },
  ]
  const trend = [
    { label: "Jan", revenue: 248000 },
    { label: "Feb", revenue: 276000 },
    { label: "Mar", revenue: 302000 },
    { label: "Apr", revenue: 335000 },
    { label: "May", revenue: 381000 },
    { label: "Jun", revenue: 418000 },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SemaphorViewCard
        title="Revenue trend"
        description="A generated chart card with active filter scope in the header."
        state={{ status: "success", records: [{ month: "Jun", revenue: 842500 }] }}
        filters={filters}
      >
        <MiniAreaChart data={trend} />
      </SemaphorViewCard>
      <SemaphorViewCard
        title="Open opportunities"
        description="A card can also make unfiltered views explicit when useful."
        state={{ status: "success", records: [{ stage: "Proposal", count: 42 }] }}
        filters={[]}
        showEmptyFilterState
      >
        <div className="grid gap-3">
          {[
            ["Proposal", "42"],
            ["Negotiation", "27"],
            ["Contract", "18"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </SemaphorViewCard>
    </div>
  )
}

function FilterControlsPreview() {
  const [region, setRegion] = useState<string | undefined>("north")
  const [segments, setSegments] = useState<Array<string | number | boolean>>([
    "enterprise",
    "mid_market",
  ])
  const [dateRange, setDateRange] = useState<Array<string | number | boolean>>([
    "2026-01-01",
    "2026-03-31",
  ])

  const handles = useMemo(
    () => [
      createDemoInputHandle({
        id: "region",
        label: "Region",
        value: region,
        setValue: (next) => setRegion(next as string | undefined),
        options: [
          { label: "North", value: "north" },
          { label: "South", value: "south" },
          { label: "West", value: "west" },
        ],
      }),
      createDemoInputHandle({
        id: "segment",
        label: "Segment",
        value: segments,
        setValue: (next) =>
          setSegments(
            Array.isArray(next)
              ? next.filter(isDemoOptionValue)
              : isDemoOptionValue(next)
                ? [next]
                : [],
          ),
        options: [
          { label: "Enterprise", value: "enterprise" },
          { label: "Mid-market", value: "mid_market" },
          { label: "SMB", value: "smb" },
        ],
      }),
      createDemoInputHandle({
        id: "order_date",
        label: "Order date",
        value: dateRange,
        setValue: (next) =>
          setDateRange(
            Array.isArray(next) ? next.filter(isDemoOptionValue) : [],
          ),
        operator: "between",
      }),
    ],
    [dateRange, region, segments],
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Filter bar</CardTitle>
            <CardDescription>
              Components bind to Semaphor input handles and preserve raw option
              values for query execution.
            </CardDescription>
          </div>
          <SemaphorActiveFilterSummaryBadge
            filters={getSemaphorActiveFilterSummaries(handles)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <SemaphorDateRangeFilter handle={handles[2]} />
          <SemaphorSingleSelectFilter
            label="Region"
            handle={handles[0]}
            hideSearch
          />
          <SemaphorMultiSelectFilter label="Segment" handle={handles[1]} />
        </div>
      </CardContent>
    </Card>
  )
}

function QueryStateBoundaryPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <PreviewState title="Stale data during refresh">
        <SemaphorQueryStateBoundary
          state={{
            status: "loading",
            isLoading: true,
            isStale: true,
            records: [{ campaign: "Pipeline", revenue: 120000 }],
          }}
        >
          <div className="rounded-md border bg-card p-4 text-sm">
            Prior query payload stays visible while the next request refreshes.
          </div>
        </SemaphorQueryStateBoundary>
      </PreviewState>
      <PreviewState title="Partial result">
        <SemaphorQueryStateBoundary
          state={{
            status: "success",
            rowLimitExceeded: true,
            records: [{ campaign: "Expansion", revenue: 95000 }],
          }}
        >
          <div className="rounded-md border bg-card p-4 text-sm">
            Partial analytics responses keep data visible with an audit badge.
          </div>
        </SemaphorQueryStateBoundary>
      </PreviewState>
      <PreviewState title="Empty state">
        <SemaphorQueryStateBoundary state={{ status: "success", records: [] }}>
          <div />
        </SemaphorQueryStateBoundary>
      </PreviewState>
      <PreviewState title="Error state">
        <SemaphorQueryStateBoundary
          state={{
            status: "error",
            error: { message: "The query could not be executed." },
          }}
        >
          <div />
        </SemaphorQueryStateBoundary>
      </PreviewState>
    </div>
  )
}

function QueryStatePreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PreviewState title="Loading">
        <QueryState title="Orders" loading>
          <div />
        </QueryState>
      </PreviewState>
      <PreviewState title="Empty">
        <QueryState title="Orders" empty>
          <div />
        </QueryState>
      </PreviewState>
      <PreviewState title="Error">
        <QueryState
          title="Orders"
          error={{ status: 500, message: "Query failed" }}
        >
          <div />
        </QueryState>
      </PreviewState>
    </div>
  )
}

function PreviewControlsCard({
  description,
  columns,
  children,
}: {
  description: string
  columns: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview controls</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${columns}`}>{children}</div>
      </CardContent>
    </Card>
  )
}

function PreviewState({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-48 flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-medium">{title}</div>
      <Separator />
      <div>{children}</div>
    </div>
  )
}

function DetailsPanel({ item }: { item: RegistryItem }) {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>When to use it</CardTitle>
          <CardDescription>{item.bestFor}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-3 md:grid-cols-3">
            <DetailPoint
              icon={CheckCircle2Icon}
              title="Source install"
              description="The shadcn CLI copies component source into the app so teams can customize it."
            />
            <DetailPoint
              icon={LayersIcon}
              title="Composable"
              description="Items can be installed independently or combined by create-semaphor-app presets."
            />
            <DetailPoint
              icon={DatabaseIcon}
              title="SDK shaped"
              description="Previews use demo data, while components are designed for react-semaphor Data App results."
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="text-sm font-medium">Installed dependencies</div>
            <div className="flex flex-wrap gap-1.5">
              {item.dependencies.map((dependency) => (
                <Badge key={dependency} variant="outline" className="font-mono">
                  {dependency}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-4">
      <Icon className="size-4 text-muted-foreground" />
      <div className="text-sm font-medium">{title}</div>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

type ControlSelectProps = {
  label: string
  value: string
  options: string[]
  onValueChange: (value: string) => void
}

function ControlSelect({
  label,
  value,
  options,
  onValueChange,
}: ControlSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function createDemoInputHandle({
  id,
  label,
  value,
  setValue,
  options,
  operator = "equals",
}: {
  id: string
  label: string
  value: unknown
  setValue: (next: unknown) => void
  options?: Array<{ label: string; value: string }>
  operator?: string
}): SemaphorInputHandle {
  return {
    id,
    label,
    kind: "filter",
    operator,
    value,
    options,
    isActive: value !== undefined && (!Array.isArray(value) || value.length > 0),
    setValue,
  } as unknown as SemaphorInputHandle
}

function isDemoOptionValue(
  value: unknown,
): value is string | number | boolean {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
}
