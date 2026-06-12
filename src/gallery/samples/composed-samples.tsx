import { useMemo, useState } from "react"
import { BarChart3Icon, LayoutDashboardIcon, Table2Icon } from "lucide-react"
import type { SemaphorInputHandle } from "react-semaphor/data-app-sdk"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  SemaphorActiveFilterSummaryBadge,
  SemaphorDateRangeFilter,
  SemaphorMultiSelectFilter,
  SemaphorSingleSelectFilter,
  getSemaphorActiveFilterSummaries,
} from "../../../registry/filter-controls"
import {
  SemaphorMetricKpiCard,
  SemaphorMultiMeasureKpis,
} from "../../../registry/metric-kpis"
import { MatrixTableView } from "../../../registry/matrix-table/view"
import { ServerDataTableView } from "../../../registry/server-data-table/view"
import { campaignRevenueMatrix } from "../demo-data/matrix-demo-data"
import {
  getDisplayedTotals,
  ordersColumns,
  ordersRows,
} from "../demo-data/records-demo-data"

type DemoOptionValue = string | number | boolean

const regionOptions = [
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "West", value: "west" },
]

const segmentOptions = [
  { label: "Enterprise", value: "enterprise" },
  { label: "Mid-market", value: "mid_market" },
  { label: "SMB", value: "smb" },
]

const trendData = [
  { label: "Jan", revenue: 248000 },
  { label: "Feb", revenue: 276000 },
  { label: "Mar", revenue: 302000 },
  { label: "Apr", revenue: 335000 },
  { label: "May", revenue: 381000 },
  { label: "Jun", revenue: 418000 },
]

const regionRevenue = [
  { label: "North", value: 842500 },
  { label: "South", value: 618300 },
  { label: "West", value: 542100 },
]

export function ComposedSamples() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <LayoutDashboardIcon className="size-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-normal">
            Data App Samples
          </h2>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Curated page patterns built from the registry components. Use these as
          the visual baseline for generated apps instead of starting from blank
          cards or ad hoc layouts.
        </p>
      </div>

      <Tabs defaultValue="executive" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
        </TabsList>
        <TabsContent value="executive">
          <ExecutiveScorecardSample />
        </TabsContent>
        <TabsContent value="operations">
          <OperationsTableSample />
        </TabsContent>
        <TabsContent value="matrix">
          <MatrixDrilldownSample />
        </TabsContent>
      </Tabs>
    </section>
  )
}

function ExecutiveScorecardSample() {
  const [region, setRegion] = useState<DemoOptionValue | undefined>("north")
  const [segments, setSegments] = useState<DemoOptionValue[]>([
    "enterprise",
    "mid_market",
  ])
  const [dateRange, setDateRange] = useState<DemoOptionValue[]>([
    "2026-01-01",
    "2026-06-30",
  ])

  const handles = useMemo(
    () => [
      createDemoInputHandle({
        id: "order_date",
        label: "Order date",
        operator: "between",
        value: dateRange,
        setValue: (next) =>
          setDateRange(Array.isArray(next) ? next.filter(isDemoOptionValue) : []),
      }),
      createDemoInputHandle({
        id: "region",
        label: "Region",
        value: region,
        setValue: (next) =>
          setRegion(isDemoOptionValue(next) ? next : undefined),
        options: regionOptions,
      }),
      createDemoInputHandle({
        id: "segment",
        label: "Segment",
        value: segments,
        setValue: (next) =>
          setSegments(Array.isArray(next) ? next.filter(isDemoOptionValue) : []),
        options: segmentOptions,
      }),
    ],
    [dateRange, region, segments],
  )

  const metricResult = {
    status: "success" as const,
    value: 2002900,
    deltaPercent: 12.4,
    measures: {
      revenue: 2002900,
      orders: 6842,
      conversion_rate: 18.6,
    },
    records: ordersRows.slice(0, 6),
  }

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit">
            Sales analytics
          </Badge>
          <h3 className="text-2xl font-semibold tracking-normal">
            Revenue performance
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            KPI summary, scoped filters, trend context, category comparison, and
            a compact records table in one scannable page.
          </p>
        </div>
        <SemaphorActiveFilterSummaryBadge
          filters={getSemaphorActiveFilterSummaries(handles)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3">
        <SemaphorDateRangeFilter handle={handles[0]} />
        <SemaphorSingleSelectFilter
          label="Region"
          handle={handles[1]}
          hideSearch
        />
        <SemaphorMultiSelectFilter label="Segment" handle={handles[2]} />
      </div>

      <div className="flex flex-col gap-5 p-5">
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SemaphorMetricKpiCard
            result={metricResult}
            label="Revenue"
            description="Primary metric"
            format="currency-compact"
            comparisonLabel="vs previous period"
          />
          <SemaphorMultiMeasureKpis
            result={metricResult}
            title="Sales summary"
            description="Related measures from one governed metric result."
            measures={[
              { key: "revenue", label: "Revenue", format: "currency-compact" },
              { key: "orders", label: "Orders", format: "number" },
              { key: "conversion_rate", label: "Conversion", format: "percent" },
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Revenue trend</CardTitle>
              <CardDescription>
                Use line or area charts when the reading task is direction over
                time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniTrendChart data={trendData} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue by region</CardTitle>
              <CardDescription>
                Ranked categories should be bounded and sorted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MiniRankedBars data={regionRevenue} />
            </CardContent>
          </Card>
        </div>

        <ServerDataTableView
          title="Recent campaign orders"
          description="A bounded records preview can sit below the KPI and chart summary."
          columns={ordersColumns}
          rows={ordersRows.slice(0, 8)}
          totalRow={getDisplayedTotals(ordersRows.slice(0, 8))}
          height={320}
          enableColumnVisibility={false}
          enableDensityToggle={false}
        />
      </div>
    </div>
  )
}

function OperationsTableSample() {
  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Table2Icon className="size-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold tracking-normal">
            Operational records page
          </h3>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          For exploratory or drill-through results, make the server-backed table
          the primary experience and keep pagination, sorting, and totals
          explicit.
        </p>
      </div>
      <ServerDataTableView
        title="All campaign orders"
        description="Server-owned pagination and sorting pattern for records results."
        columns={ordersColumns}
        rows={ordersRows.slice(0, 25)}
        pagination={{
          page: 1,
          pageSize: 25,
          pageCount: 10,
          totalRows: 240,
          hasPreviousPage: false,
          hasNextPage: true,
        }}
        totalRow={getDisplayedTotals(ordersRows.slice(0, 25))}
        sort={{ key: "revenue", direction: "desc" }}
        height={460}
      />
    </div>
  )
}

function MatrixDrilldownSample() {
  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BarChart3Icon className="size-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold tracking-normal">
            Matrix analysis page
          </h3>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Use matrix views for pivot-style comparisons where row and column
          hierarchy matters more than a chart.
        </p>
      </div>
      <MatrixTableView
        title="Campaign revenue by segment"
        description="Expandable row and column hierarchy with sticky headers."
        grid={campaignRevenueMatrix}
        height={460}
      />
    </div>
  )
}

function MiniTrendChart({
  data,
}: {
  data: Array<{ label: string; revenue: number }>
}) {
  const max = Math.max(...data.map((point) => point.revenue))
  const points = data
    .map((point, index) => {
      const x = (index / Math.max(1, data.length - 1)) * 100
      const y = 100 - (point.revenue / max) * 82
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox="0 0 100 110"
        role="img"
        aria-label="Revenue trend"
        className="h-48 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}

function MiniRankedBars({
  data,
}: {
  data: Array<{ label: string; value: number }>
}) {
  const max = Math.max(...data.map((row) => row.value))

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <div key={row.label} className="grid grid-cols-[72px_1fr_72px] items-center gap-3 text-sm">
          <span className="truncate text-muted-foreground">{row.label}</span>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(8, (row.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-right tabular-nums">
            {formatCurrencyCompact(row.value)}
          </span>
        </div>
      ))}
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

function isDemoOptionValue(value: unknown): value is DemoOptionValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}
