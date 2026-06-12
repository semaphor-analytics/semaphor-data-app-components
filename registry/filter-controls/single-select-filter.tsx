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
import type { FilterOption } from "./multi-select-filter"

export type SingleSelectFilterProps = {
  label: string
  options: FilterOption[]
  value: string | null
  onChange: (next: string | null) => void
  /** Label shown when nothing is selected. Defaults to "All". */
  emptyLabel?: string
  searchPlaceholder?: string
  allowClear?: boolean
  /** Hide the search input for short, scannable option lists. */
  hideSearch?: boolean
  align?: "start" | "end" | "center"
}

export function SingleSelectFilter({
  label,
  options,
  value,
  onChange,
  emptyLabel = "All",
  searchPlaceholder,
  allowClear = true,
  hideSearch = false,
  align = "start",
}: SingleSelectFilterProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)
  const triggerValue = selected?.label ?? emptyLabel

  function selectValue(next: string) {
    onChange(next)
    setOpen(false)
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

      <PopoverContent align={align} className="w-56 p-0">
        <Command>
          {!hideSearch ? (
            <CommandInput
              placeholder={
                searchPlaceholder ?? `Search ${label.toLowerCase()}...`
              }
            />
          ) : null}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = option.value === value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => selectValue(option.value)}
                    className="flex items-center gap-2"
                  >
                    <CheckIcon
                      className={cn(
                        "size-3.5",
                        isSelected
                          ? "text-foreground"
                          : "text-transparent",
                      )}
                    />
                    <span className="flex-1 truncate">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {allowClear && value ? (
          <div className="flex items-center justify-end border-t px-2 py-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
