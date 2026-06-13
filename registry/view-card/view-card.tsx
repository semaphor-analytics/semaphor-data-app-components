import type { ReactNode } from "react"
import { FunnelIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import {
  SemaphorQueryStateBoundary,
  type SemaphorQueryStateLike,
} from "../query-state-boundary/query-state-boundary"
import type { SemaphorViewFilterSummary } from "./filter-scope"

export type SemaphorViewFilterBadgeProps = {
  filters?: SemaphorViewFilterSummary[]
  compact?: boolean
  showEmpty?: boolean
  emptyLabel?: string
  className?: string
}

export type SemaphorViewCardProps = {
  title: string
  description?: string
  state?: SemaphorQueryStateLike
  filters?: SemaphorViewFilterSummary[]
  compactFilters?: boolean
  showEmptyFilterState?: boolean
  headerAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SemaphorViewCard({
  title,
  description,
  state,
  filters,
  compactFilters = false,
  showEmptyFilterState = false,
  headerAction,
  footer,
  children,
  className,
  contentClassName,
}: SemaphorViewCardProps) {
  const filterState = filters?.length ? "active" : "none"

  return (
    <Card
      className={className}
      data-semaphor-view-card=""
      data-semaphor-filter-state={filterState}
      data-semaphor-active-filter-count={filters?.length ?? 0}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {filters?.length || showEmptyFilterState || headerAction ? (
          <CardAction>
            <div className="flex items-center gap-2">
              <SemaphorViewFilterBadge
                filters={filters}
                compact={compactFilters}
                showEmpty={showEmptyFilterState}
              />
              {headerAction}
            </div>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className={contentClassName}>
        {state ? (
          <SemaphorQueryStateBoundary state={state}>
            {children}
          </SemaphorQueryStateBoundary>
        ) : (
          children
        )}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export function SemaphorViewFilterBadge({
  filters = [],
  compact = false,
  showEmpty = false,
  emptyLabel = "Unfiltered",
  className,
}: SemaphorViewFilterBadgeProps) {
  if (!filters.length) {
    if (!showEmpty) return null
    return (
      <Badge
        variant="outline"
        className={cn("gap-1 text-[11px] text-muted-foreground", className)}
        data-semaphor-view-filter-badge=""
        data-semaphor-filter-state="none"
        data-semaphor-active-filter-count={0}
      >
        <FunnelIcon className="size-3" />
        {emptyLabel}
      </Badge>
    )
  }

  const shown = filters.slice(0, 2)
  const overflow = filters.length - shown.length
  const label = `Scoped by ${filters.length} filter${filters.length === 1 ? "" : "s"}`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            data-semaphor-view-filter-badge=""
            data-semaphor-filter-state="active"
            data-semaphor-active-filter-count={filters.length}
            className={cn(
              compact
                ? "inline-flex h-5 items-center gap-1 rounded-sm border bg-muted/60 px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums transition-colors hover:text-foreground"
                : "inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
              className,
            )}
          />
        }
      >
        {compact ? (
          <>
            <FunnelIcon className="size-3" />
            {filters.length}
          </>
        ) : (
          <>
            <FunnelIcon className="size-3.5 shrink-0" />
            <span className="flex flex-wrap items-center gap-1">
              {shown.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5"
                >
                  <span className="text-muted-foreground">{filter.label}</span>
                  <span className="font-medium text-foreground">
                    {filter.value}
                  </span>
                </span>
              ))}
              {overflow > 0 ? (
                <span className="text-muted-foreground">+{overflow}</span>
              ) : null}
            </span>
          </>
        )}
      </TooltipTrigger>
      <TooltipContent align="end" className="px-0 py-1.5">
        <div className="flex items-center gap-1.5 px-2.5 pb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <FunnelIcon className="size-3" />
          Applied filters
        </div>
        <div className="flex flex-col">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between gap-4 px-2.5 py-1"
            >
              <span className="text-muted-foreground">{filter.label}</span>
              <span className="font-medium text-foreground tabular-nums">
                {filter.value}
              </span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
