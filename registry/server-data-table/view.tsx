import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  ChevronUp,
  Lock,
  RotateCw,
  Rows2,
  Rows3,
  SearchX,
  ServerCrash,
  SlidersHorizontal,
  TimerOff,
  WifiOff,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { classifySemaphorError, type SemaphorErrorKind } from "../query-state/format-error";
import { QueryState } from "../query-state/query-state";
import {
  summarizeServerDataTablePagination,
  type ServerDataTableColumn,
  type ServerDataTableColumnAlign,
  type ServerDataTablePagination,
  type ServerDataTableRow,
  type ServerDataTableSort,
} from "./core";
import {
  formatTableCellValue,
  isNumericColumn,
} from "./table-formatters";

export type {
  ServerDataTableColumn,
  ServerDataTableColumnAlign,
  ServerDataTablePagination,
  ServerDataTablePaginationSummary,
  ServerDataTableRow,
  ServerDataTableSort,
} from "./core";

export type ServerDataTableDensity = "comfortable" | "compact";

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
  stickyFirstColumn?: boolean;
  defaultDensity?: ServerDataTableDensity;
  enableColumnVisibility?: boolean;
  enableDensityToggle?: boolean;
  enableKeyboardPaging?: boolean;
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
  height = 480,
  pageSizeOptions = [10, 25, 50, 100],
  stickyFirstColumn = true,
  defaultDensity = "comfortable",
  enableColumnVisibility = true,
  enableDensityToggle = true,
  enableKeyboardPaging = true,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onRetry,
}: ServerDataTableViewProps<TRow>) {
  const sorting = useMemo<SortingState>(
    () => (sort ? [{ id: sort.key, desc: sort.direction === "desc" }] : []),
    [sort],
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [density, setDensity] = useState<ServerDataTableDensity>(defaultDensity);

  const hasLoadedOnceRef = useRef(false);
  if (!loading && !error) hasLoadedOnceRef.current = true;
  const isInitialLoad = loading && !hasLoadedOnceRef.current;
  const isRefetching = loading && hasLoadedOnceRef.current;

  const columnDefs = useMemo<Array<ColumnDef<TRow>>>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row) => row[column.key],
        header: column.label,
        enableSorting: column.sortable !== false,
        cell: ({ getValue }) => formatTableCellValue(getValue(), column),
      })),
    [columns],
  );

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
    const next = nextSorting[0];
    onSortChange?.(next ? { key: next.id, direction: next.desc ? "desc" : "asc" } : undefined);
  };

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is the intended state engine for this registry component.
  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, columnVisibility },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const {
    totalRows,
    page,
    pageSize,
    pageCount,
    hasPreviousPage,
    hasNextPage,
    rangeStart,
    rangeEnd,
  } = summarizeServerDataTablePagination(pagination, rows.length);

  const [pageInput, setPageInput] = useState<string>("");
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const commitPageInput = () => {
    const next = Number(pageInput);
    if (!Number.isFinite(next) || next < 1) {
      setPageInput(String(page));
      return;
    }
    const bounded = Math.min(Math.max(1, Math.floor(next)), pageCount);
    if (bounded !== page) onPageChange?.(bounded);
    else setPageInput(String(page));
  };

  const goFirst = () => hasPreviousPage && onPageChange?.(1);
  const goPrev = () => hasPreviousPage && onPageChange?.(Math.max(1, page - 1));
  const goNext = () => hasNextPage && onPageChange?.(page + 1);
  const goLast = () => hasNextPage && onPageChange?.(pageCount);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enableKeyboardPaging) return;
    if (event.key === "PageDown") {
      event.preventDefault();
      goNext();
    } else if (event.key === "PageUp") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "Home" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      goFirst();
    } else if (event.key === "End" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      goLast();
    }
  };

  const captionId = useId();
  const isEmpty = !loading && !error && rows.length === 0;
  const showInlineChrome = !isInitialLoad && !(error && rows.length === 0);

  const headerRowHeight = density === "compact" ? "h-8" : "h-10";
  const bodyCellPadding = density === "compact" ? "py-1 px-3" : "py-2 px-3";
  const footerCellPadding = density === "compact" ? "py-1.5 px-3" : "py-2 px-3";

  return (
    <section className="overflow-hidden rounded-lg border bg-card text-card-foreground">
      <header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={captionId} className="text-sm font-semibold">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {enableDensityToggle ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={
                density === "comfortable" ? "Switch to compact rows" : "Switch to comfortable rows"
              }
              title={density === "comfortable" ? "Compact rows" : "Comfortable rows"}
              onClick={() =>
                setDensity((current) => (current === "comfortable" ? "compact" : "comfortable"))
              }
            >
              {density === "comfortable" ? (
                <Rows3 className="size-4" />
              ) : (
                <Rows2 className="size-4" />
              )}
            </Button>
          ) : null}
          {enableColumnVisibility ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Show or hide columns"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <SlidersHorizontal className="size-4" />
                Columns
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table.getAllLeafColumns().map((column) => {
                    const def = columns.find((item) => item.key === column.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
                      >
                        {def?.label ?? column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      <div>
        {!showInlineChrome ? (
          <div className="p-4">
            <QueryState
              title={title}
              loading={isInitialLoad}
              error={error}
              empty={false}
              onRetry={onRetry}
            >
              {null}
            </QueryState>
          </div>
        ) : (
          <>
            {error ? (
              <div className="p-4 pb-0">
                <InlineErrorBanner error={error} onRetry={onRetry} />
              </div>
            ) : null}
            <div className="relative">
            {isRefetching ? (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden"
                aria-hidden
              >
                <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-primary/70" />
                <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
              </div>
            ) : null}

            <div
              className="relative overflow-auto overscroll-none outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              style={{ maxHeight: height }}
              tabIndex={0}
              role="region"
              aria-labelledby={captionId}
              aria-busy={isRefetching || undefined}
              onKeyDown={handleKeyDown}
            >
              <table
                className={cn(
                  "w-full caption-bottom border-separate border-spacing-0 text-sm",
                  isRefetching && "opacity-60 transition-opacity",
                )}
              >
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                      {headerGroup.headers.map((header, headerIndex) => {
                        const column = columns.find((item) => item.key === header.column.id);
                        if (!column) return null;
                        const numeric = isNumericColumn(column);
                        const align: ServerDataTableColumnAlign =
                          column.align ?? (numeric ? "right" : "left");
                        const sortable = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const isStickyCol = stickyFirstColumn && headerIndex === 0;

                        return (
                          <TableHead
                            key={header.id}
                            scope="col"
                            aria-sort={
                              sorted === "asc"
                                ? "ascending"
                                : sorted === "desc"
                                  ? "descending"
                                  : sortable
                                    ? "none"
                                    : undefined
                            }
                            style={{
                              minWidth: column.minWidth ?? (numeric ? 96 : 140),
                              maxWidth: column.maxWidth,
                            }}
                            className={cn(
                              headerRowHeight,
                              "sticky top-0 z-20 border-b bg-muted/60 px-3 text-foreground backdrop-blur supports-backdrop-filter:bg-muted/60",
                              isStickyCol &&
                                "left-0 z-30 after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border",
                            )}
                          >
                            <div
                              role={sortable ? "button" : undefined}
                              tabIndex={sortable ? 0 : undefined}
                              aria-disabled={!sortable || undefined}
                              onClick={
                                sortable ? header.column.getToggleSortingHandler() : undefined
                              }
                              onKeyDown={
                                sortable
                                  ? (event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        header.column.toggleSorting();
                                      }
                                    }
                                  : undefined
                              }
                              title={column.description}
                              className={cn(
                                "flex items-center gap-1 select-none text-xs font-medium",
                                sortable
                                  ? "cursor-pointer rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                                  : "cursor-default text-muted-foreground",
                                align === "right" && "justify-end text-right",
                                align === "center" && "justify-center text-center",
                                align === "left" && "justify-start text-left",
                              )}
                            >
                              <span className="truncate">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </span>
                              {sortable ? (
                                sorted === "asc" ? (
                                  <ChevronUp className="size-3 shrink-0" aria-hidden />
                                ) : sorted === "desc" ? (
                                  <ChevronDown className="size-3 shrink-0" aria-hidden />
                                ) : (
                                  <ChevronsUpDown
                                    className="size-3 shrink-0 opacity-40"
                                    aria-hidden
                                  />
                                )
                              ) : null}
                            </div>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>

                <TableBody>
                  {isEmpty ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length || 1}
                        className="h-40 text-center text-sm text-muted-foreground"
                      >
                        No rows found. Try adjusting filters or paging back.
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="group/row bg-card data-[state=selected]:bg-muted"
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => {
                          const column = columns.find((item) => item.key === cell.column.id);
                          if (!column) return null;
                          const numeric = isNumericColumn(column);
                          const align: ServerDataTableColumnAlign =
                            column.align ?? (numeric ? "right" : "left");
                          const isStickyCol = stickyFirstColumn && cellIndex === 0;
                          const formatted = String(
                            formatTableCellValue(cell.getValue(), column) ?? "",
                          );

                          return (
                            <TableCell
                              key={cell.id}
                              style={{
                                minWidth: column.minWidth ?? (numeric ? 96 : 140),
                                maxWidth: column.maxWidth,
                              }}
                              className={cn(
                                bodyCellPadding,
                                "border-b",
                                align === "right" && "text-right tabular-nums",
                                align === "center" && "text-center",
                                align === "left" && "text-left",
                                isStickyCol &&
                                  "sticky left-0 z-10 bg-card group-hover/row:bg-muted/50 after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border",
                              )}
                            >
                              <span className="block truncate" title={formatted}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>

                {totalRow && !isEmpty ? (
                  <TableFooter>
                    <TableRow className="hover:bg-transparent">
                      {table.getVisibleLeafColumns().map((leaf, index) => {
                        const column = columns.find((item) => item.key === leaf.id);
                        if (!column) return null;
                        const numeric = isNumericColumn(column);
                        const align: ServerDataTableColumnAlign =
                          column.align ?? (numeric ? "right" : "left");
                        const isStickyCol = stickyFirstColumn && index === 0;
                        const value = totalRow[column.key];
                        const isLabelCell = index === 0 && value === undefined;

                        return (
                          <TableCell
                            key={column.key}
                            style={{
                              minWidth: column.minWidth ?? (numeric ? 96 : 140),
                              maxWidth: column.maxWidth,
                            }}
                            className={cn(
                              footerCellPadding,
                              "sticky bottom-0 z-20 border-t bg-muted/70 font-semibold backdrop-blur supports-backdrop-filter:bg-muted/70",
                              align === "right" && "text-right tabular-nums",
                              align === "center" && "text-center",
                              align === "left" && "text-left",
                              isStickyCol &&
                                "left-0 z-30 after:absolute after:inset-y-0 after:-right-px after:w-px after:bg-border",
                            )}
                          >
                            {isLabelCell ? "Total" : formatTableCellValue(value, column)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableFooter>
                ) : null}
              </table>
            </div>
            </div>
          </>
        )}
      </div>

      <footer className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="tabular-nums" aria-live="polite">
          {totalRows === 0 ? (
            "No rows"
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{rangeStart.toLocaleString()}</span>
              {"–"}
              <span className="font-medium text-foreground">{rangeEnd.toLocaleString()}</span>{" "}
              of <span className="font-medium text-foreground">{totalRows.toLocaleString()}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                if (value) onPageSizeChange?.(Number(value));
              }}
            >
              <SelectTrigger size="sm" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={goFirst}
              disabled={!hasPreviousPage}
              aria-label="First page"
              title="First page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={goPrev}
              disabled={!hasPreviousPage}
              aria-label="Previous page"
              title="Previous page (Page Up)"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1 px-1 text-xs tabular-nums">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="h-7 w-12 rounded-md border bg-background px-2 text-center text-xs"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value.replace(/[^0-9]/g, ""))}
                onBlur={commitPageInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitPageInput();
                  }
                }}
                aria-label="Jump to page"
              />
              <span className="text-muted-foreground">of {pageCount.toLocaleString()}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={goNext}
              disabled={!hasNextPage}
              aria-label="Next page"
              title="Next page (Page Down)"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={goLast}
              disabled={!hasNextPage}
              aria-label="Last page"
              title="Last page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function InlineErrorBanner({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const info = classifySemaphorError(error);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {renderInlineErrorIcon(info.kind)}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium">{info.title}</span>
        <span className="truncate text-destructive/80">{info.message}</span>
      </div>
      {info.retryable && onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onRetry}
          className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <RotateCw className="size-3" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}

function renderInlineErrorIcon(kind: SemaphorErrorKind) {
  const className = "mt-0.5 size-4 shrink-0";
  switch (kind) {
    case "network":
      return <WifiOff className={className} aria-hidden />;
    case "timeout":
      return <TimerOff className={className} aria-hidden />;
    case "permission":
      return <Lock className={className} aria-hidden />;
    case "not_found":
      return <SearchX className={className} aria-hidden />;
    case "server":
      return <ServerCrash className={className} aria-hidden />;
    default:
      return <AlertTriangle className={className} aria-hidden />;
  }
}
