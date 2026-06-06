export type ServerDataTableDataType =
  | "string"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | (string & {});

export type ServerDataTableColumnShape = {
  key: string;
  label: string;
  dataType?: ServerDataTableDataType;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

export function isNumericColumn(column: ServerDataTableColumnShape): boolean {
  return column.dataType === "number";
}

export function formatTableCellValue(
  value: unknown,
  column: ServerDataTableColumnShape,
): string {
  if (value === null || value === undefined || value === "") return "—";

  if (column.dataType === "number" && typeof value === "number") {
    return numberFormatter.format(value);
  }

  if ((column.dataType === "date" || column.dataType === "datetime") && value) {
    const date = value instanceof Date ? value : new Date(String(value));
    if (!Number.isNaN(date.getTime())) return dateFormatter.format(date);
  }

  if (column.dataType === "boolean") return value ? "Yes" : "No";

  return String(value);
}

