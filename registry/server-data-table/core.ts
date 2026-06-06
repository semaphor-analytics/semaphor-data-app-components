import type { SemaphorResultColumn } from "react-semaphor/data-app-sdk";
import {
  isNumericColumn,
  type ServerDataTableColumnShape,
} from "./table-formatters";

export type ServerDataTableColumnAlign = "left" | "right" | "center";

export type ServerDataTableColumn = ServerDataTableColumnShape & {
  description?: string;
  sortable?: boolean;
  align?: ServerDataTableColumnAlign;
  minWidth?: number;
  maxWidth?: number;
};

export type ServerDataTableRow = Record<string, unknown>;

export type ServerDataTableSort = {
  key: string;
  direction: "asc" | "desc";
};

export type ServerDataTablePagination = {
  page: number;
  pageSize: number;
  totalRows?: number;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

export type ServerDataTablePaginationSummary = Required<
  Pick<
    ServerDataTablePagination,
    "page" | "pageSize" | "pageCount" | "hasNextPage" | "hasPreviousPage"
  >
> & {
  totalRows: number;
  rangeStart: number;
  rangeEnd: number;
};

export function toServerDataTableColumn(
  column: SemaphorResultColumn,
): ServerDataTableColumn {
  return {
    key: column.key,
    label: column.label ?? column.name ?? column.key,
    dataType: column.dataType,
  };
}

export function toServerDataTablePagination(
  pagination:
    | {
        page: number;
        pageSize: number;
        totalCount?: number;
        pageCount?: number;
        hasNextPage?: boolean;
        hasPrevPage?: boolean;
      }
    | undefined,
  fallback: {
    page: number;
    pageSize: number;
    rowCount: number;
  },
): ServerDataTablePagination {
  if (!pagination) {
    return {
      page: fallback.page,
      pageSize: fallback.pageSize,
      totalRows: fallback.rowCount,
    };
  }

  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalRows: pagination.totalCount,
    pageCount: pagination.pageCount,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPrevPage,
  };
}

export function summarizeServerDataTablePagination(
  pagination: ServerDataTablePagination | undefined,
  rowCount: number,
): ServerDataTablePaginationSummary {
  const totalRows = pagination?.totalRows ?? rowCount;
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? rowCount;
  const pageCount =
    pagination?.pageCount ?? Math.max(1, Math.ceil(totalRows / Math.max(pageSize, 1)));
  const hasPreviousPage = pagination?.hasPreviousPage ?? page > 1;
  const hasNextPage = pagination?.hasNextPage ?? page < pageCount;
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows || page * pageSize);

  return {
    totalRows,
    page,
    pageSize,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    rangeStart,
    rangeEnd,
  };
}

export function buildDisplayedNumericTotalRow<
  TRow extends ServerDataTableRow = ServerDataTableRow,
>(
  rows: TRow[],
  columns: ServerDataTableColumn[],
): Partial<Record<keyof TRow | string, unknown>> | undefined {
  const totalRow: Record<string, unknown> = {};
  let hasTotal = false;

  for (const column of columns) {
    if (!isNumericColumn(column)) continue;

    const total = rows.reduce((sum, row) => {
      const value = row[column.key];
      return typeof value === "number" && Number.isFinite(value)
        ? sum + value
        : sum;
    }, 0);
    totalRow[column.key] = total;
    hasTotal = true;
  }

  return hasTotal
    ? (totalRow as Partial<Record<keyof TRow | string, unknown>>)
    : undefined;
}
