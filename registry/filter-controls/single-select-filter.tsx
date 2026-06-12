import { useState } from "react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
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
      <div className="inline-flex h-8 items-center overflow-hidden rounded-md border bg-card text-sm">
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-full items-center gap-2 rounded-l-md pr-2 pl-3 text-left transition-colors hover:bg-secondary",
                !(allowClear && value) && "rounded-r-md",
              )}
            />
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-muted-foreground">{label}</span>
            <span className="truncate font-medium text-foreground">
              {triggerValue}
            </span>
          </span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        {allowClear && value ? (
          <>
            <span className="w-px self-stretch bg-border" aria-hidden />
            <button
              type="button"
              aria-label={`Clear ${label}`}
              className="inline-flex h-full items-center px-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => onChange(null)}
            >
              <XIcon className="size-3.5" />
            </button>
          </>
        ) : null}
      </div>

      <PopoverContent align={align} className="w-72 gap-0 p-0">
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
          <div className="flex items-center justify-end border-t p-1">
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
