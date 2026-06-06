import { useMemo, useState } from "react";
import {
  type SemaphorQueryRuntimeOptions,
  type SemaphorRecordsQueryDefinition,
  useSemaphorQuery,
} from "react-semaphor/data-app-sdk";
import {
  buildDisplayedNumericTotalRow,
  toServerDataTableColumn,
  toServerDataTablePagination,
  type ServerDataTableColumn,
  type ServerDataTableRow,
  type ServerDataTableSort,
} from "./core";
import {
  ServerDataTableView,
  type ServerDataTableViewProps,
} from "./view";

export type {
  ServerDataTableColumn,
  ServerDataTableColumnAlign,
  ServerDataTablePagination,
  ServerDataTablePaginationSummary,
  ServerDataTableRow,
  ServerDataTableSort,
} from "./core";

export type SemaphorServerDataTableQueryState = {
  page: number;
  pageSize: number;
  sort?: ServerDataTableSort;
};

export type SemaphorServerDataTableProps<TRow extends ServerDataTableRow = ServerDataTableRow> =
  Omit<
    ServerDataTableViewProps<TRow>,
    "columns" | "rows" | "pagination" | "sort" | "loading" | "error" | "onPageChange" | "onPageSizeChange" | "onSortChange"
  > & {
    queryFactory: (state: SemaphorServerDataTableQueryState) => SemaphorRecordsQueryDefinition;
    options?: SemaphorQueryRuntimeOptions;
    initialPageSize?: number;
    columns?: ServerDataTableColumn[];
  };

export function SemaphorServerDataTable<TRow extends ServerDataTableRow = ServerDataTableRow>({
  queryFactory,
  options,
  initialPageSize = 25,
  columns: providedColumns,
  totalRow: providedTotalRow,
  ...viewProps
}: SemaphorServerDataTableProps<TRow>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState<ServerDataTableSort | undefined>();

  const query = useMemo(
    () => queryFactory({ page, pageSize, sort }),
    [page, pageSize, queryFactory, sort],
  );
  const result = useSemaphorQuery<TRow>(query, options);
  const rows = useMemo(() => result.records ?? [], [result.records]);

  const columns = useMemo(
    () => providedColumns ?? result.columns?.map(toServerDataTableColumn) ?? [],
    [providedColumns, result.columns],
  );

  const pagination = toServerDataTablePagination(result.pagination, {
    page,
    pageSize,
    rowCount: rows.length,
  });

  const totalRow = useMemo(
    () => providedTotalRow ?? buildDisplayedNumericTotalRow(rows, columns),
    [columns, providedTotalRow, rows],
  );

  return (
    <ServerDataTableView
      {...viewProps}
      columns={columns}
      rows={rows}
      pagination={pagination}
      sort={sort}
      totalRow={totalRow}
      loading={result.isLoading}
      error={result.error}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
      onSortChange={(nextSort) => {
        setSort(nextSort);
        setPage(1);
      }}
    />
  );
}
