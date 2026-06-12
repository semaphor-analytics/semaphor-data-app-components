import type { ReactNode } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  type LucideIcon,
} from "lucide-react"
import type { SemaphorMetricQueryResult } from "react-semaphor/data-app-sdk"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  SemaphorQueryStateBoundary,
  type SemaphorQueryStateLike,
} from "../query-state-boundary/query-state-boundary"

type MetricValue = number | string | null | undefined
type MetricMap = Record<string, MetricValue>

export type SemaphorMetricFormat =
  | "currency"
  | "currency-compact"
  | "number"
  | "percent"
  | "raw"

export type SemaphorMetricQueryResultLike = Partial<SemaphorMetricQueryResult> &
  SemaphorQueryStateLike & {
    measures?: MetricMap
    metrics?: MetricMap
    delta?: number | null
    deltaPercent?: number | null
    comparisonValue?: MetricValue
  }

export type SemaphorMetricComparisonBadgeProps = {
  result: SemaphorMetricQueryResultLike
  deltaDirectionGood?: "up" | "down"
  label?: string
}

export function SemaphorMetricComparisonBadge({
  result,
  deltaDirectionGood = "up",
  label = "vs comparison",
}: SemaphorMetricComparisonBadgeProps) {
  const delta = result.deltaPercent ?? result.delta
  if (delta == null) return null

  const { Icon, className } = getDeltaTone(delta, deltaDirectionGood)
  const suffix = result.deltaPercent == null ? "" : "%"

  return (
    <span className="flex items-center gap-1.5 text-xs">
      <Badge variant="outline" className={cn("gap-1 tabular-nums", className)}>
        <Icon className="size-3" />
        {formatSignedNumber(delta)}
        {suffix}
      </Badge>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

export type SemaphorMetricKpiCardProps = {
  result: SemaphorMetricQueryResultLike
  label?: string
  description?: string
  measureKey?: string
  format?: SemaphorMetricFormat
  deltaDirectionGood?: "up" | "down"
  comparisonLabel?: string
  /** Optional trend series; renders a compact sparkline under the value. */
  trend?: number[]
  /** Optional accessory rendered in the header corner (e.g. filter scope). */
  headerAccessory?: ReactNode
  className?: string
}

export function SemaphorMetricKpiCard({
  result,
  label,
  description,
  measureKey,
  format = "number",
  deltaDirectionGood = "up",
  comparisonLabel,
  trend,
  headerAccessory,
  className,
}: SemaphorMetricKpiCardProps) {
  const resolved = resolveMetricValue(result, measureKey)
  const title = label ?? resolved.label ?? result.intent?.label ?? "Metric"
  const showQueryComparison = !measureKey

  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-xs">{description}</CardDescription>
        ) : null}
        {headerAccessory ? <CardAction>{headerAccessory}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <SemaphorQueryStateBoundary state={result}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatMetricValue(resolved.value, format)}
              </div>
              {showQueryComparison ? (
                <SemaphorMetricComparisonBadge
                  result={result}
                  deltaDirectionGood={deltaDirectionGood}
                  label={comparisonLabel}
                />
              ) : null}
            </div>
            {trend && trend.length > 1 ? (
              <SemaphorMetricSparkline values={trend} />
            ) : null}
          </div>
        </SemaphorQueryStateBoundary>
      </CardContent>
    </Card>
  )
}

function SemaphorMetricSparkline({
  values,
  className,
}: {
  values: number[]
  className?: string
}) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const stepX = 100 / (values.length - 1)
  const points = values.map((value, index) => {
    const x = index * stepX
    const y = 30 - ((value - min) / span) * 26
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = points.join(" ")
  const area = `${line} L100,32 L0,32 Z`

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className={cn("h-9 w-full", className)}
      aria-hidden
    >
      <path d={area} fill="var(--brand)" fillOpacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export type SemaphorMultiMeasureKpiConfig = {
  key: string
  label?: string
  format?: SemaphorMetricFormat
  /** Optional period-over-period change (percent); renders a colored delta. */
  delta?: number
}

export type SemaphorMultiMeasureKpisProps = {
  result: SemaphorMetricQueryResultLike
  title: string
  description?: string
  measures?: SemaphorMultiMeasureKpiConfig[]
  /** Direction that counts as good for the delta colors. Defaults to "up". */
  deltaDirectionGood?: "up" | "down"
  /** Optional accessory rendered in the header corner (e.g. filter scope). */
  headerAccessory?: ReactNode
  className?: string
}

export function SemaphorMultiMeasureKpis({
  result,
  title,
  description,
  measures,
  deltaDirectionGood = "up",
  headerAccessory,
  className,
}: SemaphorMultiMeasureKpisProps) {
  const metricEntries = resolveMetricEntries(result, measures)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs">{description}</CardDescription>
        ) : null}
        {headerAccessory ? <CardAction>{headerAccessory}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <SemaphorQueryStateBoundary state={result}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
            {metricEntries.map((metric, index) => (
              <div
                key={metric.key}
                className={cn(
                  "flex flex-col gap-1.5",
                  "sm:px-5",
                  index === 0 && "sm:pl-0",
                  index === metricEntries.length - 1 && "sm:pr-0",
                )}
              >
                <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {metric.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">
                    {formatMetricValue(metric.value, metric.format)}
                  </span>
                  {typeof metric.delta === "number" ? (
                    <SemaphorMeasureDelta
                      delta={metric.delta}
                      deltaDirectionGood={deltaDirectionGood}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SemaphorQueryStateBoundary>
      </CardContent>
    </Card>
  )
}

function SemaphorMeasureDelta({
  delta,
  deltaDirectionGood,
}: {
  delta: number
  deltaDirectionGood: "up" | "down"
}) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground tabular-nums">
        <MinusIcon className="size-3" />
        0%
      </span>
    )
  }

  const isGood =
    delta > 0 ? deltaDirectionGood === "up" : deltaDirectionGood === "down"
  const Icon = delta > 0 ? ArrowUpIcon : ArrowDownIcon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        isGood
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400",
      )}
    >
      <Icon className="size-3" />
      {formatSignedNumber(delta)}%
    </span>
  )
}

function resolveMetricValue(
  result: SemaphorMetricQueryResultLike,
  measureKey?: string
) {
  const map = readMetricMap(result)
  if (measureKey && Object.prototype.hasOwnProperty.call(map, measureKey)) {
    return { label: humanizeMetricKey(measureKey), value: map[measureKey] }
  }

  if (measureKey) {
    return { label: humanizeMetricKey(measureKey), value: undefined }
  }

  return { label: undefined, value: result.value }
}

function resolveMetricEntries(
  result: SemaphorMetricQueryResultLike,
  measures?: SemaphorMultiMeasureKpiConfig[]
) {
  const map = readMetricMap(result)
  const configs =
    measures ??
    Object.keys(map).map((key) => ({
      key,
      label: humanizeMetricKey(key),
      format: "number" as const,
    }))

  return configs.map((measure) => ({
    key: measure.key,
    label: measure.label ?? humanizeMetricKey(measure.key),
    value: map[measure.key],
    format: measure.format ?? "number",
    delta: "delta" in measure ? measure.delta : undefined,
  }))
}

function readMetricMap(result: SemaphorMetricQueryResultLike): MetricMap {
  return result.measures ?? result.metrics ?? {}
}

function getDeltaTone(
  delta: number,
  deltaDirectionGood: "up" | "down"
): { Icon: LucideIcon; className: string } {
  if (delta === 0) {
    return { Icon: MinusIcon, className: "bg-muted text-muted-foreground" }
  }

  const isGood =
    delta > 0 ? deltaDirectionGood === "up" : deltaDirectionGood === "down"

  return {
    Icon: delta > 0 ? ArrowUpIcon : ArrowDownIcon,
    className: isGood
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
  }
}

function formatMetricValue(value: MetricValue, format: SemaphorMetricFormat) {
  if (value == null || value === "") return "-"
  if (typeof value === "string") return value

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    case "currency-compact":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    case "percent":
      return `${formatNumber(value)}%`
    case "raw":
      return String(value)
    case "number":
    default:
      return formatNumber(value)
  }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value)
}

function formatSignedNumber(value: number) {
  const formatted = formatNumber(Math.abs(value))
  if (value === 0) return formatted
  return `${value > 0 ? "+" : "-"}${formatted}`
}

function humanizeMetricKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
