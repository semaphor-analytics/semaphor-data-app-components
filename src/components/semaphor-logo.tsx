import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

/**
 * Canonical Semaphor mark — four horizontal bars of alternating widths.
 * Geometry is fixed by `semaphor-app/brand/BRAND.md`; do not redraw it.
 */
export function SemaphorIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={cn("size-5", className)}
      {...props}
    >
      <rect x="20" y="15" width="60" height="12" rx="6" fill="currentColor" />
      <rect x="20" y="35" width="40" height="12" rx="6" fill="currentColor" />
      <rect x="40" y="55" width="40" height="12" rx="6" fill="currentColor" />
      <rect x="20" y="75" width="60" height="12" rx="6" fill="currentColor" />
    </svg>
  )
}

/**
 * Mark + wordmark lockup. The mark always pairs with the wordmark in nav —
 * never icon-only.
 */
export function SemaphorWordmark({
  className,
  iconClassName,
  ...props
}: ComponentProps<"div"> & { iconClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <SemaphorIcon className={cn("size-5 text-brand", iconClassName)} />
      <span className="text-sm font-semibold tracking-wide text-foreground">
        Semaphor
      </span>
    </div>
  )
}
