import type {
  SemaphorInputOption,
  SemaphorInputValue,
  SemaphorOptionValue,
} from "react-semaphor/data-app-sdk"

export type SemaphorOptionAdapterContext = {
  labelContext?: string
}

export function createSemaphorOptionAdapter(
  options: SemaphorInputOption[],
  context: SemaphorOptionAdapterContext = {},
) {
  const rawValueByKey = new Map<string, SemaphorOptionValue>()
  const uiOptions = options.map((option) => {
    const value = semaphorOptionValueKey(option.value)
    rawValueByKey.set(value, option.value)
    return {
      label: formatSemaphorOptionLabel(option, context),
      value,
    }
  })

  return { uiOptions, rawValueByKey }
}

export function semaphorOptionValueKey(value: SemaphorOptionValue): string {
  return `${typeof value}:${String(value)}`
}

function formatSemaphorOptionLabel(
  option: SemaphorInputOption,
  context: SemaphorOptionAdapterContext,
): string {
  const label = String(option.label ?? "").trim()
  const value = option.value
  const labelContext = context.labelContext?.toLowerCase() ?? ""

  if (typeof value === "boolean") {
    if (!label || label === String(value)) {
      return value ? "Yes" : "No"
    }
    return label
  }

  if (label === "true") return "Yes"
  if (label === "false") return "No"

  const numericValue = Number(value)
  const labelMatchesRawValue = !label || label === String(value)
  if (
    labelMatchesRawValue &&
    labelContext.includes("hour") &&
    Number.isInteger(numericValue) &&
    numericValue >= 0 &&
    numericValue <= 23
  ) {
    return `${String(numericValue).padStart(2, "0")}:00`
  }

  if (
    labelMatchesRawValue &&
    /(^|[\s_-])(flag|enabled|active|attended)([\s_-]|$)/.test(labelContext) &&
    (numericValue === 0 || numericValue === 1)
  ) {
    return numericValue === 1 ? "Yes" : "No"
  }

  return label || String(value)
}

export function toOptionValueArray(value: SemaphorInputValue | undefined) {
  if (Array.isArray(value)) {
    return value.filter(isSemaphorOptionValue)
  }
  return isSemaphorOptionValue(value) ? [value] : []
}

export function toSingleOptionValue(
  value: SemaphorInputValue | undefined
): SemaphorOptionValue | undefined {
  if (Array.isArray(value)) {
    return value.find(isSemaphorOptionValue)
  }
  return isSemaphorOptionValue(value) ? value : undefined
}

export function isSemaphorOptionValue(
  value: SemaphorInputValue | undefined
): value is SemaphorOptionValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
}
