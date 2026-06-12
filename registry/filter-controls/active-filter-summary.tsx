/* eslint-disable react-refresh/only-export-components */
import { FunnelIcon } from "lucide-react"
import type { SemaphorInputHandle } from "react-semaphor/data-app-sdk"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import { getSemaphorDateRangeFilterLabel } from "./date-range-filter"

export type SemaphorActiveFilterSummary = {
  id: string
  label: string
  value: string
}

export type SemaphorActiveFilterSummaryBadgeProps = {
  filters: SemaphorActiveFilterSummary[]
  className?: string
}

export function getSemaphorActiveFilterSummaries(
  handles: SemaphorInputHandle[],
): SemaphorActiveFilterSummary[] {
  return handles
    .filter((handle) => handle.kind === "filter" && handle.isActive)
    .map((handle) => ({
      id: handle.id,
      label: handle.label ?? handle.id,
      value: formatHandleValue(handle),
    }))
    .filter((filter) => filter.value.length > 0)
}

export function SemaphorActiveFilterSummaryBadge({
  filters = [],
  className,
}: SemaphorActiveFilterSummaryBadgeProps) {
  if (!filters.length) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-6 items-center gap-1.5 rounded-md border bg-muted/40 px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              className,
            )}
          />
        }
      >
        <FunnelIcon className="size-3" />
        <span>{filters.length === 1 ? "Filtered" : `${filters.length} filters`}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <div className="flex flex-col gap-1.5">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs"
            >
              <span className="min-w-0 truncate text-muted-foreground">
                {filter.label}
              </span>
              <span className="max-w-40 truncate font-medium text-foreground">
                {filter.value}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function formatHandleValue(handle: SemaphorInputHandle): string {
  if (isDateRangeHandle(handle)) {
    return getSemaphorDateRangeFilterLabel(handle)
  }

  const value = handle.value
  if (Array.isArray(value)) {
    if (!value.length) {
      return ""
    }
    if (value.length === 1) {
      return formatScalar(value[0])
    }
    return `${value.length} selected`
  }

  return formatScalar(value)
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return ""
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }
  return String(value)
}

function isDateRangeHandle(handle: SemaphorInputHandle) {
  return handle.operator === "between" && Array.isArray(handle.value)
}
