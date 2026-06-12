import { useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type FilterOption = {
  label: string
  value: string
}

export type MultiSelectFilterProps = {
  label: string
  options: FilterOption[]
  value: string[]
  onChange: (next: string[]) => void
  /** Label shown when no options are selected. Defaults to "All". */
  emptyLabel?: string
  /** Search placeholder. */
  searchPlaceholder?: string
  align?: "start" | "end" | "center"
}

export function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
  emptyLabel = "All",
  searchPlaceholder,
  align = "start",
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)
  const triggerValue = formatTriggerValue(value, options, emptyLabel)

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-md border bg-card px-2.5 text-xs transition-colors hover:bg-secondary"
          />
        }
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{triggerValue}</span>
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-64 p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = value.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card",
                      )}
                    >
                      {selected ? <CheckIcon className="size-3" /> : null}
                    </div>
                    <span className="flex-1 truncate">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="flex items-center justify-between gap-2 border-t px-2 py-2 text-[11px] text-muted-foreground">
          {value.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => onChange([])}
            >
              Clear
            </Button>
          ) : (
            <span />
          )}
          <span className="tabular-nums">
            {value.length === 0
              ? `${options.length} options`
              : `${value.length} of ${options.length} selected`}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function formatTriggerValue(
  selected: string[],
  options: FilterOption[],
  emptyLabel: string,
): string {
  if (selected.length === 0) return emptyLabel
  if (selected.length === 1) {
    const found = options.find((o) => o.value === selected[0])
    return found?.label ?? selected[0]
  }
  return `${selected.length} selected`
}
