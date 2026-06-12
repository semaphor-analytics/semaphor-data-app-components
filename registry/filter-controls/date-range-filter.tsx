/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef } from "react"
import { format, isValid, parseISO, startOfDay, subDays } from "date-fns"
import type {
  SemaphorInputHandle,
  SemaphorScalar,
} from "react-semaphor/data-app-sdk"

import {
  DateRangePicker,
  getPresetDateRange,
  getDateRangeLabel,
  type DateRange,
  type DateRangeDefaultPresetKey,
} from "./date-range-picker"

export type SemaphorDateRangeFilterProps = {
  label?: string
  handle: SemaphorInputHandle
  today?: Date
  align?: "start" | "end" | "center"
  fallbackDays?: number
  emptyLabel?: string
  defaultValue?: DateRange
  defaultPreset?: DateRangeDefaultPresetKey
  initializeWhenEmpty?: boolean
}

export function SemaphorDateRangeFilter({
  label,
  handle,
  today = startOfDay(new Date()),
  align = "start",
  fallbackDays = 30,
  emptyLabel = "Any time",
  defaultValue,
  defaultPreset,
  initializeWhenEmpty = false,
}: SemaphorDateRangeFilterProps) {
  const activeValue = toActiveDateRange(handle.value)
  const appliedDefaultKeyRef = useRef<string | null>(null)
  const explicitDefaultValue = useMemo(() => {
    if (defaultValue) return defaultValue
    if (defaultPreset) return getPresetDateRange(defaultPreset, today)
    if (initializeWhenEmpty) return fallbackDateRange(today, fallbackDays)
    return undefined
  }, [defaultPreset, defaultValue, fallbackDays, initializeWhenEmpty, today])
  const value =
    activeValue ??
    explicitDefaultValue ??
    fallbackDateRange(today, fallbackDays)

  useEffect(() => {
    if (!explicitDefaultValue || hasDateRangeValue(handle.value)) {
      return
    }
    const defaultKey = [
      formatDateValue(explicitDefaultValue.from),
      formatDateValue(explicitDefaultValue.to),
    ].join(":")
    if (appliedDefaultKeyRef.current === defaultKey) {
      return
    }
    appliedDefaultKeyRef.current = defaultKey
    handle.setValue([
      formatDateValue(explicitDefaultValue.from),
      formatDateValue(explicitDefaultValue.to),
    ])
  }, [explicitDefaultValue, handle])

  return (
    <DateRangePicker
      label={label ?? handle.label ?? "Date range"}
      value={value}
      today={today}
      align={align}
      emptyLabel={emptyLabel}
      isValueActive={Boolean(activeValue ?? explicitDefaultValue)}
      onClear={() => {
        appliedDefaultKeyRef.current = null
        handle.setValue(undefined)
      }}
      onChange={(next) => {
        handle.setValue([formatDateValue(next.from), formatDateValue(next.to)])
      }}
    />
  )
}

function hasDateRangeValue(value: SemaphorInputHandle["value"]) {
  return (
    Array.isArray(value) &&
    Boolean(parseDateValue(value[0]) && parseDateValue(value[1]))
  )
}

export function getSemaphorDateRangeFilterLabel(
  handle: SemaphorInputHandle,
  today = startOfDay(new Date()),
  fallbackDays = 30
) {
  const activeValue = toActiveDateRange(handle.value)
  if (!activeValue) return "Any time"
  return getDateRangeLabel(
    activeValue ?? fallbackDateRange(today, fallbackDays),
    today
  )
}

function toActiveDateRange(
  value: SemaphorInputHandle["value"]
): DateRange | null {
  const values = Array.isArray(value) ? value : []
  const from = parseDateValue(values[0])
  const to = parseDateValue(values[1])

  if (from && to) {
    return { from, to }
  }

  if (from) {
    return { from, to: from }
  }

  return null
}

function fallbackDateRange(today: Date, fallbackDays: number): DateRange {
  return {
    from: subDays(today, Math.max(1, fallbackDays) - 1),
    to: today,
  }
}

function parseDateValue(value: SemaphorScalar | undefined): Date | null {
  if (typeof value === "string" || typeof value === "number") {
    const date = typeof value === "number" ? new Date(value) : parseISO(value)
    return isValid(date) ? startOfDay(date) : null
  }

  return null
}

function formatDateValue(date: Date) {
  return format(date, "yyyy-MM-dd")
}
