/* eslint-disable react-refresh/only-export-components */
import { useState } from "react"
import {
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  startOfDay,
  format,
  isSameDay,
} from "date-fns"
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DateRange = { from: Date; to: Date }

export type DateRangePresetKey =
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_12_months"
  | "month_to_date"
  | "year_to_date"
  | "custom"

export type DateRangeDefaultPresetKey = Exclude<DateRangePresetKey, "custom">

type Preset = {
  key: DateRangeDefaultPresetKey
  label: string
  compute: (today: Date) => DateRange
}

const PRESETS: Preset[] = [
  {
    key: "last_7_days",
    label: "Last 7 days",
    compute: (today) => ({ from: subDays(today, 6), to: today }),
  },
  {
    key: "last_30_days",
    label: "Last 30 days",
    compute: (today) => ({ from: subDays(today, 29), to: today }),
  },
  {
    key: "last_90_days",
    label: "Last 90 days",
    compute: (today) => ({ from: subDays(today, 89), to: today }),
  },
  {
    key: "last_12_months",
    label: "Last 12 months",
    compute: (today) => ({ from: subMonths(today, 12), to: today }),
  },
  {
    key: "month_to_date",
    label: "Month to date",
    compute: (today) => ({ from: startOfMonth(today), to: today }),
  },
  {
    key: "year_to_date",
    label: "Year to date",
    compute: (today) => ({ from: startOfYear(today), to: today }),
  },
]

export type DateRangePickerProps = {
  value: DateRange
  onChange: (next: DateRange, preset: DateRangePresetKey) => void
  /** "Today" anchor used for preset math. Defaults to today. */
  today?: Date
  /** Optional explicit label. When omitted, the active preset/range is shown. */
  label?: string
  /** Text shown when the owning Semaphor input has no active date value. */
  emptyLabel?: string
  isValueActive?: boolean
  /** When provided and the value is active, renders an inline clear affordance. */
  onClear?: () => void
  align?: "start" | "end" | "center"
}

export function DateRangePicker({
  value,
  onChange,
  today = startOfDay(new Date()),
  label = "Date range",
  emptyLabel = "Any time",
  isValueActive = true,
  onClear,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange>(value)
  const [activePreset, setActivePreset] = useState<DateRangePresetKey>(() =>
    detectPreset(value, today)
  )

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value)
      setActivePreset(detectPreset(value, today))
    }
    setOpen(nextOpen)
  }

  function selectPreset(preset: Preset) {
    const range = preset.compute(today)
    setDraft(range)
    setActivePreset(preset.key)
  }

  function selectCustom(range: { from?: Date; to?: Date } | undefined) {
    if (!range?.from) return
    setDraft({ from: range.from, to: range.to ?? range.from })
    setActivePreset("custom")
  }

  function apply() {
    onChange(draft, activePreset)
    setOpen(false)
  }

  const triggerValue = isValueActive
    ? formatTriggerValue(value, detectPreset(value, today))
    : emptyLabel

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="inline-flex h-8 items-center overflow-hidden rounded-md border bg-card text-sm">
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "inline-flex h-full items-center gap-2 rounded-l-md pr-2 pl-2.5 transition-colors hover:bg-secondary",
                !(onClear && isValueActive) && "rounded-r-md",
              )}
            />
          }
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{triggerValue}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </PopoverTrigger>
        {onClear && isValueActive ? (
          <>
            <span className="w-px self-stretch bg-border" aria-hidden />
            <button
              type="button"
              aria-label={`Clear ${label}`}
              className="inline-flex h-full items-center px-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={onClear}
            >
              <XIcon className="size-3.5" />
            </button>
          </>
        ) : null}
      </div>

      <PopoverContent align={align} className="w-auto p-0">
        <div className="flex flex-col md:flex-row">
          <ul className="flex w-full shrink-0 flex-col gap-0.5 border-b p-2 md:w-40 md:border-r md:border-b-0">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.key
              return (
                <li key={preset.key}>
                  <button
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={cn(
                      "flex w-full min-h-7 items-center rounded-md px-2 py-1 text-left text-sm transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                </li>
              )
            })}
            <li className="mt-0.5 border-t pt-1.5">
              <span
                className={cn(
                  "block px-2.5 py-1.5 text-xs",
                  activePreset === "custom"
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                Custom range
              </span>
            </li>
          </ul>
          <div className="p-2">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={draft}
              onSelect={selectCustom}
              defaultMonth={draft.from}
              required
            />
            <div className="flex items-center justify-between gap-3 border-t px-1 pt-3 text-xs">
              <span className="text-muted-foreground tabular-nums">
                {formatRange(draft)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={apply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Returns the user-facing label for a date range - either the preset name
 * (e.g., "Last 30 days") or a formatted range when the dates don't match any
 * preset.
 */
export function getDateRangeLabel(range: DateRange, today: Date): string {
  return formatTriggerValue(range, detectPreset(range, today))
}

export function getPresetDateRange(
  presetKey: DateRangeDefaultPresetKey,
  today: Date
): DateRange | undefined {
  return PRESETS.find((preset) => preset.key === presetKey)?.compute(today)
}

function detectPreset(range: DateRange, today: Date): DateRangePresetKey {
  for (const preset of PRESETS) {
    const candidate = preset.compute(today)
    if (
      isSameDay(candidate.from, range.from) &&
      isSameDay(candidate.to, range.to)
    ) {
      return preset.key
    }
  }
  return "custom"
}

function formatTriggerValue(
  range: DateRange,
  preset: DateRangePresetKey
): string {
  if (preset === "custom") return formatRange(range)
  return PRESETS.find((p) => p.key === preset)?.label ?? formatRange(range)
}

function formatRange(range: DateRange): string {
  const sameYear = range.from.getFullYear() === range.to.getFullYear()
  const fromStr = format(range.from, sameYear ? "MMM d" : "MMM d, yyyy")
  const toStr = format(range.to, "MMM d, yyyy")
  return `${fromStr} - ${toStr}`
}
