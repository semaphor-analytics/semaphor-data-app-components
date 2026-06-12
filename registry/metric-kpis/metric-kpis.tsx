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
  className,
}: SemaphorMetricKpiCardProps) {
  const resolved = resolveMetricValue(result, measureKey)
  const title = label ?? resolved.label ?? result.intent?.label ?? "Metric"
  const showQueryComparison = !measureKey

  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-xs">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <SemaphorQueryStateBoundary state={result}>
          <div className="flex flex-col gap-2">
            <div className="text-3xl font-semibold tracking-normal tabular-nums">
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
        </SemaphorQueryStateBoundary>
      </CardContent>
    </Card>
  )
}

export type SemaphorMultiMeasureKpiConfig = {
  key: string
  label?: string
  format?: SemaphorMetricFormat
}

export type SemaphorMultiMeasureKpisProps = {
  result: SemaphorMetricQueryResultLike
  title: string
  description?: string
  measures?: SemaphorMultiMeasureKpiConfig[]
  className?: string
}

export function SemaphorMultiMeasureKpis({
  result,
  title,
  description,
  measures,
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
      </CardHeader>
      <CardContent>
        <SemaphorQueryStateBoundary state={result}>
          <div className="grid gap-4 sm:grid-cols-3">
            {metricEntries.map((metric) => (
              <div key={metric.key} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {metric.label}
                </span>
                <span className="text-2xl font-semibold tabular-nums">
                  {formatMetricValue(metric.value, metric.format)}
                </span>
              </div>
            ))}
          </div>
        </SemaphorQueryStateBoundary>
      </CardContent>
    </Card>
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
