import type { ReactNode } from "react"
import {
  AlertCircleIcon,
  InboxIcon,
  Loader2Icon,
  RefreshCwIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  staleLabel = "Refreshing",
  onRetry,
}: SemaphorQueryStateBoundaryProps) {
  const isLoading = state.isLoading || state.status === "loading"
  const isError = Boolean(state.error) || state.status === "error"
  const isEmpty = resolveQueryIsEmpty(state)
  const isPartial = resolveQueryIsPartial(state)
  const canShowStaleData = Boolean(
    (state.isStale || isLoading) && hasRenderablePayload(state) && !isEmpty
  )

  if (isLoading && !canShowStaleData) {
    return loading ?? <DefaultLoadingState />
  }

  if (isError && state.error && !canShowStaleData) {
    if (typeof error === "function") return error(state.error)
    return error ?? <DefaultErrorState error={state.error} onRetry={onRetry} />
  }

  if (isEmpty && !canShowStaleData) {
    return empty ?? <DefaultEmptyState />
  }

  return (
    <div className="flex flex-col gap-3">
      {(isPartial || canShowStaleData || isError) && (
        <div className="flex flex-wrap items-center gap-2">
          {isPartial ? (
            <Badge variant="outline" className="gap-1">
              <TriangleAlertIcon className="size-3" />
              Partial
            </Badge>
          ) : null}
          {canShowStaleData ? (
            <Badge variant="secondary" className="gap-1">
              <Loader2Icon className="size-3 animate-spin" />
              {staleLabel}
            </Badge>
          ) : null}
          {isError && state.error ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircleIcon className="size-3" />
              Last refresh failed
            </Badge>
          ) : null}
        </div>
      )}
      {isPartial ? (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>Partial result</AlertTitle>
          <AlertDescription>{partialMessage}</AlertDescription>
        </Alert>
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

function hasRenderablePayload(state: SemaphorQueryStateLike) {
  return derivePayloadIsEmpty(state) === false && hasKnownPayloadShape(state)
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

function hasKnownPayloadShape(state: SemaphorQueryStateLike) {
  return [
    "options",
    "matrixResult",
    "grid",
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
    "value",
    "measures",
    "metrics",
    "records",
    "output",
  ].some((key) => Object.prototype.hasOwnProperty.call(state, key))
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
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-56" />
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
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>This view could not load</AlertTitle>
      <AlertDescription>
        {error.message ?? "The query failed."}
      </AlertDescription>
      {onRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 w-fit gap-1.5"
          onClick={onRetry}
        >
          <RefreshCwIcon className="size-3.5" />
          Retry
        </Button>
      ) : null}
    </Alert>
  )
}
