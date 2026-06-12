import type {
  SemaphorInputHandle,
  SemaphorInputOption,
} from "react-semaphor/data-app-sdk"

import {
  MultiSelectFilter,
  type MultiSelectFilterProps,
} from "./multi-select-filter"
import {
  SingleSelectFilter,
  type SingleSelectFilterProps,
} from "./single-select-filter"
import {
  createSemaphorOptionAdapter,
  isSemaphorOptionValue,
  semaphorOptionValueKey,
  toOptionValueArray,
  toSingleOptionValue,
} from "./option-adapter"

type CommonSemaphorFilterProps = {
  label: string
  handle: SemaphorInputHandle
  options?: SemaphorInputOption[]
}

export type SemaphorMultiSelectFilterProps = CommonSemaphorFilterProps &
  Pick<MultiSelectFilterProps, "emptyLabel" | "searchPlaceholder" | "align">

export type SemaphorSingleSelectFilterProps = CommonSemaphorFilterProps &
  Pick<
    SingleSelectFilterProps,
    "emptyLabel" | "searchPlaceholder" | "allowClear" | "hideSearch" | "align"
  >

export function SemaphorMultiSelectFilter({
  label,
  handle,
  options,
  ...filterProps
}: SemaphorMultiSelectFilterProps) {
  const adapter = createSemaphorOptionAdapter(options ?? handle.options, {
    labelContext: [label, handle.label, handle.id].filter(Boolean).join(" "),
  })
  const selectedValues = toOptionValueArray(handle.value)

  return (
    <MultiSelectFilter
      label={label}
      options={adapter.uiOptions}
      value={selectedValues.map(semaphorOptionValueKey)}
      onChange={(nextKeys) => {
        const nextValues = nextKeys
          .map((key) => adapter.rawValueByKey.get(key))
          .filter(isSemaphorOptionValue)
        handle.setValue(nextValues.length > 0 ? nextValues : undefined)
      }}
      {...filterProps}
    />
  )
}

export function SemaphorSingleSelectFilter({
  label,
  handle,
  options,
  ...filterProps
}: SemaphorSingleSelectFilterProps) {
  const adapter = createSemaphorOptionAdapter(options ?? handle.options, {
    labelContext: [label, handle.label, handle.id].filter(Boolean).join(" "),
  })
  const selectedValue = toSingleOptionValue(handle.value)

  return (
    <SingleSelectFilter
      label={label}
      options={adapter.uiOptions}
      value={
        selectedValue === undefined
          ? null
          : semaphorOptionValueKey(selectedValue)
      }
      onChange={(nextKey) => {
        if (!nextKey) {
          handle.setValue(undefined)
          return
        }
        handle.setValue(adapter.rawValueByKey.get(nextKey))
      }}
      {...filterProps}
    />
  )
}
