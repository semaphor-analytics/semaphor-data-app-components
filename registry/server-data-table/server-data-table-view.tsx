import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QueryState } from "../query-state/query-state";
import {
  formatTableCellValue,
  isNumericColumn,
  type ServerDataTableColumnShape,
} from "./table-formatters";

export type ServerDataTableColumn = ServerDataTableColumnShape & {
  description?: string;
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

export type ServerDataTableViewProps<TRow extends ServerDataTableRow = ServerDataTableRow> = {
  title?: string;
  description?: string;
  columns: ServerDataTableColumn[];
  rows: TRow[];
  pagination?: ServerDataTablePagination;
  sort?: ServerDataTableSort;
  totalRow?: Partial<Record<keyof TRow | string, unknown>>;
  loading?: boolean;
  error?: unknown;
  height?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sort: ServerDataTableSort | undefined) => void;
  onRetry?: () => void;
};

export function ServerDataTableView<TRow extends ServerDataTableRow = ServerDataTableRow>({
  title = "Data table",
  description,
  columns,
  rows,
  pagination,
  sort,
  totalRow,
  loading = false,
  error,
  height = 420,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRetry,
}: ServerDataTableViewProps<TRow>) {
  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort.key, desc: sort.direction === "desc" }] : []),
    [sort],
  );

  const columnDefs = useMemo<Array<ColumnDef<TRow>>>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row) => row[column.key],
        header: column.label,
        cell: ({ getValue }) => formatTableCellValue(getValue(), column),
      })),
    [columns],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
    const next = nextSorting[0];
    onSortChange?.(next ? { key: next.id, direction: next.desc ? "desc" : "asc" } : undefined);
  };

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
  });

  const totalRows = pagination?.totalRows ?? rows.length;
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? rows.length;
  const pageCount = pagination?.pageCount ?? Math.max(1, Math.ceil(totalRows / Math.max(pageSize, 1)));
  const hasPreviousPage = pagination?.hasPreviousPage ?? page > 1;
  const hasNextPage = pagination?.hasNextPage ?? page < pageCount;

  return (
    <section className="rounded-lg border bg-card text-card-foreground">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <Badge variant="secondary">{totalRows.toLocaleString()} rows</Badge>
      </div>

      <div className="p-4">
        <QueryState
          title={title}
          loading={loading}
          error={error}
          empty={!loading && !error && rows.length === 0}
          onRetry={onRetry}
        >
          <div className="overflow-hidden rounded-md border">
            <div className="overflow-auto" style={{ maxHeight: height }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        const column = columns.find((item) => item.key === header.column.id);
                        const sorted = header.column.getIsSorted();

                        return (
                          <TableHead
                            key={header.id}
                            className={column && isNumericColumn(column) ? "text-right" : undefined}
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-1 text-xs font-medium"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sorted === "asc" ? (
                                <ChevronUp className="ml-1 size-3" />
                              ) : sorted === "desc" ? (
                                <ChevronDown className="ml-1 size-3" />
                              ) : (
                                <ChevronsUpDown className="ml-1 size-3 opacity-50" />
                              )}
                            </Button>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const column = columns.find((item) => item.key === cell.column.id);
                        return (
                          <TableCell
                            key={cell.id}
                            className={column && isNumericColumn(column) ? "text-right tabular-nums" : undefined}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>

                {totalRow ? (
                  <TableFooter>
                    <TableRow>
                      {columns.map((column, index) => (
                        <TableCell
                          key={column.key}
                          className={isNumericColumn(column) ? "text-right font-semibold tabular-nums" : "font-semibold"}
                        >
                          {index === 0 && totalRow[column.key] === undefined
                            ? "Displayed total"
                            : formatTableCellValue(totalRow[column.key], column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableFooter>
                ) : null}
              </Table>
            </div>
          </div>
        </QueryState>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          Page {page.toLocaleString()} of {pageCount.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} rows
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={!hasPreviousPage}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={!hasNextPage}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
