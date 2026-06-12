import type {
  SemaphorInputOption,
  SemaphorInputValue,
  SemaphorOptionValue,
} from "react-semaphor/data-app-sdk"

export function createSemaphorOptionAdapter(options: SemaphorInputOption[]) {
  const rawValueByKey = new Map<string, SemaphorOptionValue>()
  const uiOptions = options.map((option) => {
    const value = semaphorOptionValueKey(option.value)
    rawValueByKey.set(value, option.value)
    return {
      label: option.label,
      value,
    }
  })

  return { uiOptions, rawValueByKey }
}

export function semaphorOptionValueKey(value: SemaphorOptionValue): string {
  return `${typeof value}:${String(value)}`
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
