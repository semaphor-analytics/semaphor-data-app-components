import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import {
  AlertCircleIcon,
  BlocksIcon,
  CheckCircle2Icon,
  CopyIcon,
  DatabaseIcon,
  FilterIcon,
  Grid3X3Icon,
  LayersIcon,
  LineChartIcon,
  PackageIcon,
  Table2Icon,
  type LucideIcon,
} from "lucide-react"
import type { SemaphorInputHandle } from "react-semaphor/data-app-sdk"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ServerDataTableBasicExample,
  type ServerTableExampleControls,
} from "./examples/server-data-table-basic"
import {
  MatrixTableBasicExample,
  type MatrixTableExampleControls,
} from "./examples/matrix-table-basic"
import { ComposedSamples } from "./samples/composed-samples"

type RegistryItemId =
  | "query-state-boundary"
  | "metric-kpis"
  | "filter-controls"
  | "server-data-table"
  | "matrix-table"
  | "query-state"

type RegistryItem = {
  id: RegistryItemId
  title: string
  category: "State" | "Metrics" | "Inputs" | "Tables"
  icon: LucideIcon
  summary: string
  bestFor: string
  installs: string[]
  dependencies: string[]
}

const registryItems: RegistryItem[] = [
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
    id: "metric-kpis",
    title: "Metric KPIs",
    category: "Metrics",
    icon: LineChartIcon,
    summary:
      "KPI cards for primary metric values, comparison badges, and multi-measure metric maps.",
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

export function ComponentGallery() {
  const [activeItemId, setActiveItemId] =
    useState<RegistryItemId>("query-state-boundary")
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

  const activeItem =
    registryItems.find((item) => item.id === activeItemId) ?? registryItems[0]
  const ActiveIcon = activeItem.icon

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Semaphor Data Apps</Badge>
              <Badge variant="outline">shadcn registry</Badge>
              <Badge variant="outline">Live demo data</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-normal">
                Component Gallery
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Browse installable Semaphor UI components, preview their states,
                and copy the registry item names to pull only the pieces your
                Data App needs.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a href="https://github.com/semaphor-analytics/semaphor-data-app-components" />
              }
            >
              <PackageIcon data-icon="inline-start" />
              Registry repo
            </Button>
            <Button nativeButton={false} render={<a href="#install" />}>
              <CopyIcon data-icon="inline-start" />
              Install
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {registryItems.map((item) => (
            <ComponentCatalogCard
              key={item.id}
              item={item}
              selected={item.id === activeItemId}
              onSelect={() => setActiveItemId(item.id)}
            />
          ))}
        </section>

        <ComposedSamples />

        <section className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BlocksIcon className="size-4 text-muted-foreground" />
              Components
            </div>
            <div className="flex flex-col gap-2">
              {registryItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "flex items-start gap-3 rounded-md border p-3 text-left text-sm transition-colors",
                      item.id === activeItemId
                        ? "border-primary bg-secondary"
                        : "bg-card hover:bg-secondary/60",
                    ].join(" ")}
                    onClick={() => setActiveItemId(item.id)}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {item.bestFor}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <Tabs defaultValue="preview" className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ActiveIcon className="size-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold tracking-normal">
                      {activeItem.title}
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {activeItem.summary}
                  </p>
                </div>
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="install">Install</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview">
                {renderPreview({
                  item: activeItem,
                  serverControls,
                  setServerControls,
                  matrixControls,
                  setMatrixControls,
                })}
              </TabsContent>

              <TabsContent value="install" id="install">
                <InstallPanel item={activeItem} />
              </TabsContent>

              <TabsContent value="details">
                <DetailsPanel item={activeItem} />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </main>
  )
}

function ComponentCatalogCard({
  item,
  selected,
  onSelect,
}: {
  item: RegistryItem
  selected: boolean
  onSelect: () => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      className={[
        "rounded-lg border bg-card p-4 text-left transition-colors hover:bg-secondary/60",
        selected ? "border-primary" : "",
      ].join(" ")}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            <span className="font-medium">{item.title}</span>
          </div>
          <Badge variant="outline">{item.category}</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
      </div>
    </button>
  )
}

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

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <SemaphorMetricKpiCard
        result={metricResult}
        label="Revenue"
        description="Primary SDK metric value"
        format="currency-compact"
      />
      <SemaphorMultiMeasureKpis
        result={metricResult}
        title="Performance summary"
        description="Secondary measures render from result.measures without reusing the primary comparison badge."
        measures={[
          { key: "revenue", label: "Revenue", format: "currency-compact" },
          { key: "orders", label: "Orders", format: "number" },
          { key: "conversion_rate", label: "Conversion", format: "percent" },
        ]}
      />
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
    <div className="flex min-h-48 flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="text-sm font-medium">{title}</div>
      <Separator />
      <div>{children}</div>
    </div>
  )
}

function InstallPanel({ item }: { item: RegistryItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Install {item.title}</CardTitle>
        <CardDescription>
          Run this from a React app that already has shadcn and react-semaphor.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <CodeBlock
          code={item.installs
            .map(
              (name) =>
                `npx shadcn@latest add semaphor-analytics/semaphor-data-app-components/${name}`,
            )
            .join("\n")}
        />
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium">Installed dependencies</div>
          <div className="flex flex-wrap gap-2">
            {item.dependencies.map((dependency) => (
              <Badge key={dependency} variant="secondary">
                {dependency}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailsPanel({ item }: { item: RegistryItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>When to use it</CardTitle>
        <CardDescription>{item.bestFor}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
      </CardContent>
    </Card>
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
    <div className="flex flex-col gap-2 rounded-md border bg-card p-4">
      <Icon className="size-4 text-muted-foreground" />
      <div className="text-sm font-medium">{title}</div>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 text-xs leading-6">
      <code>{code}</code>
    </pre>
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
