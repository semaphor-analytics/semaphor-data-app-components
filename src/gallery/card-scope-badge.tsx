import { FunnelIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type CardScopeFilter = {
  id: string
  label: string
  value: string
}

/**
 * A compact affordance showing which filters scope a card. Hovering reveals the
 * applied filters. Use `compact` for dense surfaces like KPI cards.
 */
export function CardScopeBadge({
  filters,
  compact = false,
  className,
}: {
  filters: CardScopeFilter[]
  compact?: boolean
  className?: string
}) {
  if (!filters.length) return null

  const shown = filters.slice(0, 2)
  const overflow = filters.length - shown.length

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          compact ? (
            <span
              aria-label={`Scoped by ${filters.length} filter${filters.length === 1 ? "" : "s"}`}
              className={cn(
                "inline-flex h-5 cursor-default items-center gap-1 rounded-sm border border-border bg-muted/60 px-1.5 text-[11px] font-medium text-muted-foreground tabular-nums transition-colors hover:text-foreground",
                className,
              )}
            />
          ) : (
            <span
              className={cn(
                "inline-flex cursor-default items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
                className,
              )}
            />
          )
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
