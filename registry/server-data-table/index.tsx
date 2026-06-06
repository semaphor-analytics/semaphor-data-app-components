import { useMemo, useState } from "react";
import {
  type SemaphorQueryRuntimeOptions,
  type SemaphorRecordsQueryDefinition,
  type SemaphorResultColumn,
  useSemaphorQuery,
} from "react-semaphor/data-app-sdk";
import {
  ServerDataTableView,
  type ServerDataTableColumn,
  type ServerDataTablePagination,
  type ServerDataTableRow,
  type ServerDataTableSort,
  type ServerDataTableViewProps,
} from "./view";

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

  const columns = useMemo(
    () => providedColumns ?? result.columns?.map(toServerColumn) ?? [],
    [providedColumns, result.columns],
  );

  const pagination = result.pagination
    ? toServerPagination(result.pagination)
    : { page, pageSize, totalRows: result.records?.length ?? 0 };

  return (
    <ServerDataTableView
      {...viewProps}
      columns={columns}
      rows={result.records ?? []}
      pagination={pagination}
      sort={sort}
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

function toServerColumn(column: SemaphorResultColumn): ServerDataTableColumn {
  return {
    key: column.key,
    label: column.label ?? column.name ?? column.key,
    dataType: column.dataType,
  };
}

function toServerPagination(pagination: {
  page: number;
  pageSize: number;
  totalCount?: number;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}): ServerDataTablePagination {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalRows: pagination.totalCount,
    pageCount: pagination.pageCount,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPrevPage,
  };
}

