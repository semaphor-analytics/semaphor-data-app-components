import type { ReactNode } from "react"
import {
  AlertCircleIcon,
  InboxIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export type SemaphorQueryStateLike = {
  status?: "idle" | "loading" | "success" | "error"
  isLoading?: boolean
  isEmpty?: boolean
  isPartial?: boolean
  isStale?: boolean
  rowLimitExceeded?: boolean
  executionResult?: {
    status?: string
    diagnosticFeedback?: { status?: string }
    coverage?: { missingObligations?: unknown[] }
  }
  error?: { message?: string } | null
  value?: unknown
  measures?: Record<string, unknown>
  metrics?: Record<string, unknown>
  records?: unknown[]
  options?: unknown[]
  output?: unknown
  answerSummary?: unknown
  resultSets?: Record<string, { records?: unknown[] } | undefined>
  matrixResult?: { cells?: unknown[] }
  grid?: { cells?: unknown[]; rows?: Array<{ cells?: unknown[] }> }
  primary?: unknown[]
  comparisons?: unknown[]
  contributors?: unknown[]
  segments?: unknown[]
  periodChanges?: unknown[]
  changes?: unknown[]
  drivers?: unknown[]
  absoluteDeltaDrivers?: unknown[]
  largestNegativeChanges?: unknown[]
  largestPositiveChanges?: unknown[]
  largestNegativeDrivers?: unknown[]
  largestPositiveDrivers?: unknown[]
}

export type SemaphorQueryStateBoundaryProps = {
  state: SemaphorQueryStateLike
  children: ReactNode
  loading?: ReactNode
  empty?: ReactNode
  error?:
    | ReactNode
    | ((error: NonNullable<SemaphorQueryStateLike["error"]>) => ReactNode)
  partialMessage?: string
  staleLabel?: string
  onRetry?: () => void
}

export function SemaphorQueryStateBoundary({
  state,
  children,
  loading,
  empty,
  error,
  partialMessage = "This view returned a partial result.",
  onRetry,
}: SemaphorQueryStateBoundaryProps) {
  const isLoading = state.isLoading || state.status === "loading"
  const isError = Boolean(state.error) || state.status === "error"
  const isEmpty = resolveQueryIsEmpty(state)
  const isPartial = resolveQueryIsPartial(state)
  if (isLoading) {
    return loading ?? <DefaultLoadingState />
  }

  if (isError && state.error) {
    if (typeof error === "function") return error(state.error)
    return error ?? <DefaultErrorState error={state.error} onRetry={onRetry} />
  }

  if (isEmpty) {
    return empty ?? <DefaultEmptyState />
  }

  return (
    <div className="flex flex-col gap-3">
      {isPartial ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1" title={partialMessage}>
            <TriangleAlertIcon className="size-3" />
            Partial
          </Badge>
        </div>
      ) : null}
      {children}
    </div>
  )
}

function resolveQueryIsEmpty(state: SemaphorQueryStateLike) {
  if (typeof state.isEmpty === "boolean") return state.isEmpty
  if (state.status !== "success") return false
  return derivePayloadIsEmpty(state)
}

function resolveQueryIsPartial(state: SemaphorQueryStateLike) {
  return Boolean(
    state.isPartial ||
    state.rowLimitExceeded ||
    state.executionResult?.status === "partial" ||
    state.executionResult?.diagnosticFeedback?.status === "partial" ||
    state.executionResult?.coverage?.missingObligations?.length
  )
}

function derivePayloadIsEmpty(state: SemaphorQueryStateLike) {
  if (Object.prototype.hasOwnProperty.call(state, "options")) {
    return !hasItems(state.options)
  }

  if (hasMatrixPayload(state)) {
    return !hasItems(state.matrixResult?.cells) && !hasGridCells(state.grid)
  }

  if (hasAnalysisPayload(state)) {
    return (
      !state.answerSummary &&
      !hasItems(state.records) &&
      !hasItems(state.primary) &&
      !hasItems(state.comparisons) &&
      !hasItems(state.contributors) &&
      !hasItems(state.segments) &&
      !hasItems(state.periodChanges) &&
      !hasItems(state.changes) &&
      !hasItems(state.drivers) &&
      !hasItems(state.absoluteDeltaDrivers) &&
      !hasItems(state.largestNegativeChanges) &&
      !hasItems(state.largestPositiveChanges) &&
      !hasItems(state.largestNegativeDrivers) &&
      !hasItems(state.largestPositiveDrivers) &&
      !Object.values(state.resultSets ?? {}).some((resultSet) =>
        hasItems(resultSet?.records)
      )
    )
  }

  if (hasMetricPayload(state)) {
    return (
      state.value == null &&
      !hasMetricMapValue(state.measures) &&
      !hasMetricMapValue(state.metrics) &&
      !hasItems(state.records)
    )
  }

  if (Object.prototype.hasOwnProperty.call(state, "records")) {
    return !hasItems(state.records) && state.output === undefined
  }

  return false
}

function hasAnalysisPayload(state: SemaphorQueryStateLike) {
  return [
    "answerSummary",
    "resultSets",
    "primary",
    "comparisons",
    "contributors",
    "segments",
    "periodChanges",
    "changes",
    "drivers",
    "absoluteDeltaDrivers",
    "largestNegativeChanges",
    "largestPositiveChanges",
    "largestNegativeDrivers",
    "largestPositiveDrivers",
  ].some((key) => Object.prototype.hasOwnProperty.call(state, key))
}

function hasMatrixPayload(state: SemaphorQueryStateLike) {
  return (
    Object.prototype.hasOwnProperty.call(state, "matrixResult") ||
    Object.prototype.hasOwnProperty.call(state, "grid")
  )
}

function hasMetricPayload(state: SemaphorQueryStateLike) {
  return (
    Object.prototype.hasOwnProperty.call(state, "value") ||
    Object.prototype.hasOwnProperty.call(state, "measures") ||
    Object.prototype.hasOwnProperty.call(state, "metrics")
  )
}

function hasItems(value: unknown[] | undefined) {
  return Array.isArray(value) && value.length > 0
}

function hasMetricMapValue(map: Record<string, unknown> | undefined) {
  return Boolean(
    map &&
    Object.values(map).some(
      (value) => value !== null && value !== undefined && value !== ""
    )
  )
}

function hasGridCells(
  grid: { cells?: unknown[]; rows?: Array<{ cells?: unknown[] }> } | undefined
) {
  return (
    hasItems(grid?.cells) ||
    Boolean(grid?.rows?.some((row) => hasItems(row.cells)))
  )
}

function DefaultLoadingState() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-5 w-14 rounded-sm" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3.5 w-full rounded-sm" />
        <Skeleton className="h-3.5 w-[82%] rounded-sm" />
        <Skeleton className="h-3.5 w-[55%] rounded-sm" />
      </div>
    </div>
  )
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
        <InboxIcon className="size-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">No data</span>
        <span className="text-xs text-muted-foreground">
          The query returned an empty result for the current inputs.
        </span>
      </div>
    </div>
  )
}

function DefaultErrorState({
  error,
  onRetry,
}: {
  error: NonNullable<SemaphorQueryStateLike["error"]>
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <AlertCircleIcon className="size-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">
          Couldn’t load this view
        </span>
        <span className="text-xs text-muted-foreground">
          {error.message ?? "The query failed."}
        </span>
      </div>
      {onRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-1 gap-1.5"
          onClick={onRetry}
        >
          <RefreshCwIcon className="size-3.5" />
          Retry
        </Button>
      ) : null}
    </div>
  )
}
