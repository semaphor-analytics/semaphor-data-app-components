export type SemaphorViewFilterSummary = {
  id: string
  label: string
  value: string
}

export type SemaphorViewFilterScope = Record<string, string[] | undefined>

export function getSemaphorViewFilterSummaries({
  filters,
  viewId,
  filterScope,
}: {
  filters: SemaphorViewFilterSummary[]
  viewId?: string
  filterScope?: SemaphorViewFilterScope
}) {
  if (!viewId || !filterScope) {
    return filters
  }

  return filters.filter((filter) => {
    const scopedViewIds = filterScope[filter.id]
    return Array.isArray(scopedViewIds) && scopedViewIds.includes(viewId)
  })
}

