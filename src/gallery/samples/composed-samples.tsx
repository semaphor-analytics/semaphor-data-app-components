import { useEffect, useMemo, useRef, useState } from "react"
import type { SemaphorInputHandle } from "react-semaphor/data-app-sdk"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CardScopeBadge, type CardScopeFilter } from "../card-scope-badge"
import {
  SemaphorQueryStateBoundary,
  type SemaphorQueryStateLike,
} from "../../../registry/query-state-boundary"
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

const revenueTrendSpark = trendData.map((point) => point.revenue)

const regionRevenue = [
  { label: "North", value: 842500 },
  { label: "South", value: 618300 },
  { label: "West", value: 542100 },
]

const campaignRevenue = [
  { label: "Spring", value: 612000 },
  { label: "Expansion", value: 548000 },
  { label: "Partner", value: 470000 },
  { label: "Renewal", value: 372900 },
]

const segmentSplit = [
  { label: "Enterprise", value: 1062000 },
  { label: "Mid-market", value: 624000 },
  { label: "SMB", value: 316900 },
]

type DashboardDemoState =
  | "ready"
  | "loading"
  | "refreshing"
  | "partial"
  | "error"
  | "empty"

const DEMO_STATE_OPTIONS: { value: DashboardDemoState; label: string }[] = [
  { value: "ready", label: "Ready" },
  { value: "loading", label: "Loading" },
  { value: "partial", label: "Partial" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
]

const DEMO_ERROR = {
  name: "QueryError",
  message: "The query could not be executed.",
}

/** Wrap a ready payload in the query-state shape for the selected demo state. */
function withDemoState(
  demoState: DashboardDemoState,
  payload: SemaphorQueryStateLike,
): SemaphorQueryStateLike {
  switch (demoState) {
    case "loading":
      return { status: "loading", isLoading: true }
    case "refreshing":
      return { ...payload, status: "loading", isLoading: true, isStale: true }
    case "partial":
      return { ...payload, status: "success", rowLimitExceeded: true }
    case "error":
      return { status: "error", error: DEMO_ERROR }
    case "empty":
      return { status: "success", records: [] }
    case "ready":
    default:
      return { ...payload, status: "success" }
  }
}

function metricResultFor(demoState: DashboardDemoState) {
  const measures = { revenue: 2002900, orders: 6842, conversion_rate: 18.6 }
  const ready = {
    value: 2002900,
    deltaPercent: 12.4,
    measures,
    records: ordersRows.slice(0, 6),
  }
  switch (demoState) {
    case "loading":
      return { status: "success" as const, isLoading: true }
    case "refreshing":
      return {
        ...ready,
        status: "success" as const,
        isLoading: true,
        isStale: true,
      }
    case "partial":
      return { ...ready, status: "success" as const, rowLimitExceeded: true }
    case "error":
      return { status: "success" as const, error: DEMO_ERROR }
    case "empty":
      return { status: "success" as const, value: null, measures: {}, records: [] }
    case "ready":
    default:
      return { ...ready, status: "success" as const }
  }
}

function StateSwitcher({
  value,
  onChange,
}: {
  value: DashboardDemoState
  onChange: (next: DashboardDemoState) => void
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as DashboardDemoState)
      }}
    >
      <SelectTrigger className="h-8 gap-1.5 border-border bg-card">
        <span className="text-muted-foreground">State</span>
        <SelectValue className="font-medium capitalize" />
      </SelectTrigger>
      <SelectContent>
        {DEMO_STATE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ExecutiveScorecardSample() {
  const [demoState, setDemoState] = useState<DashboardDemoState>("ready")
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

  const summaries = getSemaphorActiveFilterSummaries(handles)
  const scopedBy = (ids: string[]): CardScopeFilter[] =>
    summaries.filter((summary) => ids.includes(summary.id))

  const metricResult = metricResultFor(demoState)
  const tableRows = demoState === "empty" ? [] : ordersRows.slice(0, 8)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SemaphorActiveFilterSummaryBadge filters={summaries} />
          <StateSwitcher value={demoState} onChange={setDemoState} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SemaphorDateRangeFilter handle={handles[0]} />
          <SemaphorSingleSelectFilter
            label="Region"
            handle={handles[1]}
            hideSearch
          />
          <SemaphorMultiSelectFilter label="Segment" handle={handles[2]} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <SemaphorMetricKpiCard
          result={metricResult}
          label="Revenue"
          description="Primary metric"
          format="currency-compact"
          comparisonLabel="vs previous period"
          trend={revenueTrendSpark}
          headerAccessory={<CardScopeBadge compact filters={summaries} />}
        />
        <SemaphorMultiMeasureKpis
          result={metricResult}
          title="Sales summary"
          description="Related measures from one governed metric result."
          headerAccessory={<CardScopeBadge compact filters={summaries} />}
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

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="Revenue trend"
          description="Use line or area charts when the reading task is direction over time."
          scope={scopedBy(["order_date", "region"])}
          state={withDemoState(demoState, { records: trendData })}
          className="lg:col-span-3"
        >
          <MiniAreaChart data={trendData} />
        </ChartCard>
        <ChartCard
          title="Revenue by segment"
          description="Donut charts work for part-to-whole splits with few slices."
          scope={scopedBy(["order_date", "region"])}
          state={withDemoState(demoState, { records: segmentSplit })}
          compactScope
          className="lg:col-span-2"
        >
          <MiniDonutChart data={segmentSplit} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="Revenue by campaign"
          description="Column charts compare a handful of named categories."
          scope={scopedBy(["order_date", "region", "segment"])}
          state={withDemoState(demoState, { records: campaignRevenue })}
          className="lg:col-span-3"
        >
          <MiniBarChart data={campaignRevenue} />
        </ChartCard>
        <ChartCard
          title="Revenue by region"
          description="Ranked categories should be bounded and sorted."
          scope={scopedBy(["order_date", "segment"])}
          state={withDemoState(demoState, { records: regionRevenue })}
          compactScope
          className="lg:col-span-2"
        >
          <MiniRankedBars data={regionRevenue} />
        </ChartCard>
      </div>

      <ServerDataTableView
        title="Recent campaign orders"
        description="A bounded records preview can sit below the KPI and chart summary."
        columns={ordersColumns}
        rows={tableRows}
        totalRow={
          tableRows.length ? getDisplayedTotals(tableRows) : undefined
        }
        loading={demoState === "loading" || demoState === "refreshing"}
        error={demoState === "error" ? DEMO_ERROR : undefined}
        height={320}
        enableColumnVisibility={false}
        enableDensityToggle={false}
      />
    </div>
  )
}

export function OperationsTableSample() {
  return (
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
      height={560}
    />
  )
}

export function MatrixDrilldownSample() {
  return (
    <MatrixTableView
      title="Campaign revenue by segment"
      description="Expandable row and column hierarchy with sticky headers."
      grid={campaignRevenueMatrix}
      height={560}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Chart shell + charts                                               */
/* ------------------------------------------------------------------ */

function ChartCard({
  title,
  description,
  scope,
  compactScope = false,
  state,
  className,
  children,
}: {
  title: string
  description?: string
  scope?: CardScopeFilter[]
  compactScope?: boolean
  state?: SemaphorQueryStateLike
  className?: string
  children: React.ReactNode
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {scope && scope.length > 0 ? (
          <CardAction>
            <CardScopeBadge filters={scope} compact={compactScope} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {state ? (
          <SemaphorQueryStateBoundary state={state}>
            {children}
          </SemaphorQueryStateBoundary>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(600)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next && next > 0) setWidth(next)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

function MiniAreaChart({
  data,
}: {
  data: Array<{ label: string; revenue: number }>
}) {
  const [ref, width] = useMeasuredWidth()
  const height = 184
  const padTop = 16
  const padBottom = 10
  const padX = 3

  const values = data.map((point) => point.revenue)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const lo = min - range * 0.18
  const span = max - lo || 1

  const plotWidth = Math.max(width - padX * 2, 1)
  const plotHeight = height - padTop - padBottom
  const baseline = height - padBottom

  const xs = data.map(
    (_, index) => padX + (index / Math.max(1, data.length - 1)) * plotWidth,
  )
  const ys = data.map(
    (point) => padTop + (1 - (point.revenue - lo) / span) * plotHeight,
  )

  const linePath = xs
    .map((x, index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${ys[index].toFixed(1)}`)
    .join(" ")
  const areaPath = `${linePath} L${xs[xs.length - 1].toFixed(1)},${baseline} L${xs[0].toFixed(1)},${baseline} Z`

  const gridCount = 4

  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} className="relative w-full" style={{ height }}>
        <svg
          width={width}
          height={height}
          role="img"
          aria-label="Revenue trend"
          className="overflow-visible"
        >
          {Array.from({ length: gridCount }).map((_, index) => {
            const y = padTop + (index / (gridCount - 1)) * plotHeight
            return (
              <line
                key={index}
                x1={padX}
                y1={y}
                x2={padX + plotWidth}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray={index === gridCount - 1 ? "0" : "2 4"}
              />
            )
          })}
          <path d={areaPath} fill="var(--brand)" fillOpacity={0.1} />
          <path
            d={linePath}
            fill="none"
            stroke="var(--brand)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {xs.map((x, index) => {
            const last = index === xs.length - 1
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={ys[index]}
                  r={last ? 4 : 2.75}
                  fill="var(--background)"
                  stroke="var(--brand)"
                  strokeWidth={2}
                />
                <circle
                  cx={x}
                  cy={ys[index]}
                  r={14}
                  fill="transparent"
                  style={{ pointerEvents: "all" }}
                >
                  <title>{`${data[index].label}: ${formatCurrencyCompact(data[index].revenue)}`}</title>
                </circle>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}

function MiniBarChart({
  data,
}: {
  data: Array<{ label: string; value: number }>
}) {
  const [ref, width] = useMeasuredWidth()
  const height = 196
  const padTop = 20
  const padBottom = 26

  const max = Math.max(...data.map((row) => row.value))
  const plotHeight = height - padTop - padBottom
  const slot = width / data.length
  const barWidth = Math.min(56, slot * 0.5)
  const gridCount = 4

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg width={width} height={height} className="overflow-visible">
        {Array.from({ length: gridCount }).map((_, index) => {
          const y = padTop + (index / (gridCount - 1)) * plotHeight
          return (
            <line
              key={index}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={index === gridCount - 1 ? "0" : "2 4"}
            />
          )
        })}
        {data.map((row, index) => {
          const barHeight = max > 0 ? (row.value / max) * plotHeight : 0
          const x = slot * index + (slot - barWidth) / 2
          const y = padTop + (plotHeight - barHeight)
          return (
            <g key={row.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={3}
                fill="var(--brand)"
              />
              <rect
                x={slot * index}
                y={padTop}
                width={slot}
                height={plotHeight}
                fill="transparent"
                style={{ pointerEvents: "all" }}
              >
                <title>{`${row.label}: ${formatCurrencyCompact(row.value)}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={y - 7}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
              >
                {formatCurrencyCompact(row.value)}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-foreground)"
              >
                {row.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

const donutPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function MiniDonutChart({
  data,
}: {
  data: Array<{ label: string; value: number }>
}) {
  const total = data.reduce((sum, row) => sum + row.value, 0) || 1
  const size = 144
  const stroke = 20
  const radius = (size - stroke) / 2 - 6
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  const segments = data.map((row, index) => {
    const fraction = row.value / total
    const length = fraction * circumference
    const precedingLength = data
      .slice(0, index)
      .reduce((sum, prev) => sum + (prev.value / total) * circumference, 0)
    return {
      ...row,
      length,
      offset: -precedingLength,
      color: donutPalette[index % donutPalette.length],
      fraction,
    }
  })

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <div className="relative size-36 shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="size-36 -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          {segments.map((segment) => (
            <circle
              key={segment.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={stroke}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={segment.offset}
            >
              <title>{`${segment.label}: ${formatCurrencyCompact(segment.value)} · ${Math.round(segment.fraction * 100)}%`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-semibold tabular-nums">
            {formatCurrencyCompact(total)}
          </span>
          <span className="text-[11px] text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {segment.label}
            </span>
            <span className="shrink-0 font-medium tabular-nums">
              {formatCurrencyCompact(segment.value)}
            </span>
            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
              {Math.round(segment.fraction * 100)}%
            </span>
          </div>
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
    <div className="flex flex-col gap-3.5">
      {data.map((row, index) => (
        <div
          key={row.label}
          className="flex flex-col gap-1.5"
          title={`${row.label}: ${formatCurrencyCompact(row.value)}`}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-flex size-4 items-center justify-center rounded-sm bg-muted text-[10px] font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <span className="text-foreground">{row.label}</span>
            </span>
            <span className="font-medium tabular-nums">
              {formatCurrencyCompact(row.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${Math.max(6, (row.value / max) * 100)}%` }}
            />
          </div>
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
