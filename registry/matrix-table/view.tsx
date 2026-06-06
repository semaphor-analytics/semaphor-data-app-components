import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Columns3,
  Rows3,
  TableProperties,
} from "lucide-react";
import type {
  MatrixGridProjection,
  SemaphorMatrixQueryResult,
} from "react-semaphor/data-app-sdk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QueryState } from "../query-state/query-state";

type MatrixResult = NonNullable<SemaphorMatrixQueryResult["matrixResult"]>;
type MatrixGridRow = MatrixGridProjection["rows"][number];
type MatrixGridColumn = MatrixGridProjection["columns"][number];
type MatrixGridCell = MatrixGridRow["cells"][number];
type MatrixHeaderRow = MatrixGridProjection["columnHeaderRows"][number];
type MatrixHeaderCell = MatrixHeaderRow["cells"][number];
type MatrixPathSegment = MatrixGridRow["rowPath"][number];

const MATRIX_ROW_HEADER_WIDTH = 300;
const MATRIX_DATA_COLUMN_WIDTH = 164;
const MATRIX_HEADER_ROW_HEIGHT = 40;

export type MatrixTableSort = {
  axis: "row" | "column";
  targetId: string;
  direction: "asc" | "desc";
};

export type MatrixTableViewProps = {
  title?: string;
  description?: string;
  grid?: MatrixGridProjection;
  result?: MatrixResult;
  loading?: boolean;
  error?: unknown;
  height?: number;
  stickyFirstColumn?: boolean;
  sort?: MatrixTableSort;
  onSortChange?: (sort: MatrixTableSort | undefined) => void;
  onRetry?: () => void;
};

export function MatrixTableView({
  title = "Matrix table",
  description,
  grid,
  result,
  loading = false,
  error,
  height = 480,
  stickyFirstColumn = true,
  sort,
  onSortChange,
  onRetry,
}: MatrixTableViewProps) {
  const [collapsedRowPathKeys, setCollapsedRowPathKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedColumnPathKeys, setCollapsedColumnPathKeys] = useState<
    Set<string>
  >(() => new Set());
  const sourceGrid = useMemo(
    () => grid ?? (result ? matrixResultToGridProjection(result) : undefined),
    [grid, result],
  );
  const displayGrid = useMemo(
    () =>
      sourceGrid
        ? projectVisibleMatrixGrid({
            grid: sourceGrid,
            collapsedRowPathKeys,
            collapsedColumnPathKeys,
          })
        : undefined,
    [collapsedColumnPathKeys, collapsedRowPathKeys, sourceGrid],
  );
  const isInitialLoad = loading && !displayGrid;
  const isRefetching = loading && Boolean(displayGrid);
  const rowHeaderLabel =
    displayGrid?.rowHeaderLevels.map((level) => level.label).join(" / ") ||
    "Rows";
  const gridTemplateColumns = displayGrid
    ? `${MATRIX_ROW_HEADER_WIDTH}px repeat(${displayGrid.columns.length}, minmax(${MATRIX_DATA_COLUMN_WIDTH}px, 1fr))`
    : undefined;
  const minTableWidth = displayGrid
    ? MATRIX_ROW_HEADER_WIDTH +
      displayGrid.columns.length * MATRIX_DATA_COLUMN_WIDTH
    : undefined;
  const sourceRowById = useMemo(
    () => new Map(sourceGrid?.rows.map((row) => [row.id, row]) ?? []),
    [sourceGrid],
  );
  const expandableRowPathKeys = useMemo(
    () =>
      sourceGrid?.rows
        .filter((row) => row.hasChildren)
        .map((row) => matrixPathKey(row.rowPath)) ?? [],
    [sourceGrid],
  );
  const expandableColumnPathKeys = useMemo(
    () => (sourceGrid ? getExpandableColumnPathKeys(sourceGrid) : []),
    [sourceGrid],
  );
  const allRowsExpanded =
    expandableRowPathKeys.length > 0 &&
    !expandableRowPathKeys.some((key) => collapsedRowPathKeys.has(key));
  const allColumnsExpanded =
    expandableColumnPathKeys.length > 0 &&
    !expandableColumnPathKeys.some((key) => collapsedColumnPathKeys.has(key));
  const showAxisControls =
    expandableRowPathKeys.length > 0 || expandableColumnPathKeys.length > 0;
  const toggleRowPath = (path: MatrixPathSegment[]) => {
    setCollapsedRowPathKeys((current) =>
      toggleSetValue(current, matrixPathKey(path)),
    );
  };
  const toggleColumnPath = (path: MatrixPathSegment[]) => {
    setCollapsedColumnPathKeys((current) =>
      toggleSetValue(current, matrixPathKey(path)),
    );
  };
  const toggleAllRows = () => {
    setCollapsedRowPathKeys(
      allRowsExpanded ? new Set(expandableRowPathKeys) : new Set(),
    );
  };
  const toggleAllColumns = () => {
    setCollapsedColumnPathKeys(
      allColumnsExpanded ? new Set(expandableColumnPathKeys) : new Set(),
    );
  };

  return (
    <section className="overflow-hidden rounded-md border bg-card text-card-foreground">
      <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-6">{title}</h3>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {displayGrid ? (
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <TableProperties className="size-3.5" aria-hidden />
            {displayGrid.rows.length} rows x {displayGrid.columns.length} columns
          </div>
        ) : null}
      </div>

      <QueryState
        title={title}
        loading={isInitialLoad}
        error={error}
        empty={Boolean(displayGrid && displayGrid.rows.length === 0)}
        emptyTitle="No matrix rows found"
        emptyDescription="Try changing filters, row levels, column levels, or the selected measure."
        onRetry={onRetry}
      >
        {displayGrid && gridTemplateColumns ? (
          <div
            className={cn(
              "relative isolate overflow-auto transition-opacity",
              isRefetching && "opacity-60",
            )}
            style={{ maxHeight: height }}
            aria-busy={loading || undefined}
          >
            <div
              role="table"
              aria-label={title}
              className="relative isolate"
              style={
                minTableWidth
                  ? { minWidth: minTableWidth, width: "100%" }
                  : undefined
              }
            >
              <div role="rowgroup">
                {showAxisControls
                  ? renderAxisControlRow({
                      displayGrid,
                      gridTemplateColumns,
                      rowHeaderLabel,
                      stickyFirstColumn,
                      hasExpandableRows: expandableRowPathKeys.length > 0,
                      hasExpandableColumns:
                        expandableColumnPathKeys.length > 0,
                      allRowsExpanded,
                      allColumnsExpanded,
                      onToggleAllRows: toggleAllRows,
                      onToggleAllColumns: toggleAllColumns,
                    })
                  : null}
                {renderHeaderRows({
                  displayGrid,
                  sourceColumns: sourceGrid?.columns ?? [],
                  gridTemplateColumns,
                  rowHeaderLabel: showAxisControls ? "" : rowHeaderLabel,
                  stickyFirstColumn,
                  topOffsetRows: showAxisControls ? 1 : 0,
                  collapsedColumnPathKeys,
                  onToggleColumnPath: toggleColumnPath,
                })}
                {displayGrid.columnHeaderRows.length === 0
                  ? renderFlatColumnHeaderRow({
                      displayGrid,
                      gridTemplateColumns,
                      rowHeaderLabel: showAxisControls ? "" : rowHeaderLabel,
                      topOffsetRows: showAxisControls ? 1 : 0,
                      sort,
                      onSortChange,
                    })
                  : null}
              </div>
              <div role="rowgroup">
                {displayGrid.rows.map((row) => {
                  const sourceRow = sourceRowById.get(row.id) ?? row;
                  return (
                    <div
                      key={row.id}
                      role="row"
                      className="grid"
                      style={{ gridTemplateColumns }}
                    >
                      <div
                        role="rowheader"
                        className={cn(
                          "sticky left-0 z-40 flex min-h-11 items-center overflow-hidden border-r bg-card px-3 py-2 text-sm",
                          row.role !== "value" && "bg-muted font-medium",
                          row.role === "rowGrandTotal" && "bg-muted font-semibold",
                          stickyFirstColumn &&
                            "shadow-[1px_0_0_hsl(var(--border))]",
                        )}
                      >
                        <div
                          className="flex min-w-0 items-center gap-2"
                          style={{ paddingLeft: Math.max(row.depth, 0) * 14 }}
                        >
                          <span className="min-w-0 truncate">{row.label}</span>
                          {sourceRow.hasChildren ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground"
                              aria-label={`${
                                isRowCollapsed(sourceRow, collapsedRowPathKeys)
                                  ? "Expand"
                                  : "Collapse"
                              } ${row.label}`}
                              onClick={() => toggleRowPath(sourceRow.rowPath)}
                            >
                              {isRowCollapsed(sourceRow, collapsedRowPathKeys) ? (
                                <ChevronRight className="size-3.5" aria-hidden />
                              ) : (
                                <ChevronDown className="size-3.5" aria-hidden />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {displayGrid.columns.map((column) => (
                        <MatrixValueCell
                          key={`${row.id}:${column.id}`}
                          row={row}
                          column={column}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </QueryState>
    </section>
  );
}

function renderAxisControlRow({
  displayGrid,
  gridTemplateColumns,
  rowHeaderLabel,
  stickyFirstColumn,
  hasExpandableRows,
  hasExpandableColumns,
  allRowsExpanded,
  allColumnsExpanded,
  onToggleAllRows,
  onToggleAllColumns,
}: {
  displayGrid: MatrixGridProjection;
  gridTemplateColumns: string;
  rowHeaderLabel: string;
  stickyFirstColumn: boolean;
  hasExpandableRows: boolean;
  hasExpandableColumns: boolean;
  allRowsExpanded: boolean;
  allColumnsExpanded: boolean;
  onToggleAllRows: () => void;
  onToggleAllColumns: () => void;
}) {
  return (
    <div role="row" className="grid" style={{ gridTemplateColumns }}>
      <div
      role="columnheader"
      className={cn(
          "sticky left-0 top-0 z-50 flex h-10 items-center overflow-hidden border-b border-r bg-muted px-3 text-xs font-medium text-muted-foreground",
          stickyFirstColumn && "shadow-[1px_0_0_hsl(var(--border))]",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasExpandableRows ? (
            <ExpandAllButton
              axis="rows"
              expanded={allRowsExpanded}
              onClick={onToggleAllRows}
            />
          ) : (
            <Rows3 className="size-3.5 shrink-0" aria-hidden />
          )}
          <span className="min-w-0 truncate">{rowHeaderLabel}</span>
        </div>
      </div>
      <div
        role="columnheader"
        className="sticky top-0 z-30 flex h-10 items-center overflow-hidden border-b border-r bg-muted px-3 text-xs font-medium text-muted-foreground"
        style={{ gridColumn: `span ${displayGrid.columns.length}` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasExpandableColumns ? (
            <ExpandAllButton
              axis="columns"
              expanded={allColumnsExpanded}
              onClick={onToggleAllColumns}
            />
          ) : (
            <Columns3 className="size-3.5 shrink-0" aria-hidden />
          )}
          <span className="min-w-0 truncate">Columns</span>
        </div>
      </div>
    </div>
  );
}

function renderHeaderRows({
  displayGrid,
  sourceColumns,
  gridTemplateColumns,
  rowHeaderLabel,
  stickyFirstColumn,
  topOffsetRows,
  collapsedColumnPathKeys,
  onToggleColumnPath,
}: {
  displayGrid: MatrixGridProjection;
  sourceColumns: MatrixGridColumn[];
  gridTemplateColumns: string;
  rowHeaderLabel: string;
  stickyFirstColumn: boolean;
  topOffsetRows: number;
  collapsedColumnPathKeys: Set<string>;
  onToggleColumnPath: (path: MatrixPathSegment[]) => void;
}) {
  return displayGrid.columnHeaderRows.map((headerRow, rowIndex) => (
    <div
      key={headerRow.id}
      role="row"
      className="grid"
      style={{ gridTemplateColumns }}
    >
      <div
        role="columnheader"
        className={cn(
          "sticky left-0 z-50 flex h-10 items-center overflow-hidden border-b border-r bg-muted px-3 text-xs font-medium text-muted-foreground",
          stickyFirstColumn && "shadow-[1px_0_0_hsl(var(--border))]",
        )}
        style={{ top: (rowIndex + topOffsetRows) * MATRIX_HEADER_ROW_HEIGHT }}
      >
        <span className="min-w-0 truncate">
          {rowIndex === 0 ? rowHeaderLabel : ""}
        </span>
      </div>
      {headerRow.cells.map((cell) => (
        <MatrixHeaderCellView
          key={cell.id}
          cell={cell}
          rowIndex={rowIndex + topOffsetRows}
          sourceColumns={sourceColumns}
          collapsedColumnPathKeys={collapsedColumnPathKeys}
          onToggleColumnPath={onToggleColumnPath}
        />
      ))}
    </div>
  ));
}

function renderFlatColumnHeaderRow({
  displayGrid,
  gridTemplateColumns,
  rowHeaderLabel,
  topOffsetRows,
  sort,
  onSortChange,
}: {
  displayGrid: MatrixGridProjection;
  gridTemplateColumns: string;
  rowHeaderLabel: string;
  topOffsetRows: number;
  sort?: MatrixTableSort;
  onSortChange?: (sort: MatrixTableSort | undefined) => void;
}) {
  return (
    <div role="row" className="grid" style={{ gridTemplateColumns }}>
      <div
        role="columnheader"
        className="sticky left-0 top-0 z-50 flex h-10 items-center overflow-hidden border-b border-r bg-muted px-3 text-xs font-medium text-muted-foreground"
        style={{ top: topOffsetRows * MATRIX_HEADER_ROW_HEIGHT }}
      >
        <span className="truncate">{rowHeaderLabel}</span>
      </div>
      {displayGrid.columns.map((column) => (
        <div
          key={column.id}
          role="columnheader"
          className="sticky top-0 z-20 flex h-10 items-center justify-end overflow-hidden border-b border-r bg-muted px-3 text-right text-xs font-medium text-muted-foreground"
          style={{ top: topOffsetRows * MATRIX_HEADER_ROW_HEIGHT }}
        >
          <SortButton
            label={column.label}
            active={sort?.targetId === column.id ? sort.direction : undefined}
            onClick={
              onSortChange
                ? () => onSortChange(nextSort(sort, "column", column.id))
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

function ExpandAllButton({
  axis,
  expanded,
  onClick,
}: {
  axis: "rows" | "columns";
  expanded: boolean;
  onClick: () => void;
}) {
  const noun = axis === "rows" ? "rows" : "columns";
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-6 shrink-0 text-muted-foreground"
      aria-label={`${expanded ? "Collapse" : "Expand"} all ${noun}`}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <ChevronRight
        className={cn("size-3.5 transition-transform", expanded && "rotate-90")}
        aria-hidden
      />
    </Button>
  );
}

function MatrixHeaderCellView({
  cell,
  rowIndex,
  sourceColumns,
  collapsedColumnPathKeys,
  onToggleColumnPath,
}: {
  cell: MatrixHeaderCell;
  rowIndex: number;
  sourceColumns: MatrixGridColumn[];
  collapsedColumnPathKeys: Set<string>;
  onToggleColumnPath: (path: MatrixPathSegment[]) => void;
}) {
  const expandable = isHeaderCellExpandable(cell, sourceColumns);
  const collapsed = isColumnPathCollapsed(
    cell.columnPath,
    collapsedColumnPathKeys,
  );
  return (
    <div
      role="columnheader"
      className={cn(
        "sticky z-20 flex h-10 items-center overflow-hidden whitespace-nowrap border-b border-r bg-muted px-2 text-center text-xs font-medium text-muted-foreground",
        cell.role === "grandTotal" && "font-semibold text-foreground",
      )}
      style={{
        top: rowIndex * MATRIX_HEADER_ROW_HEIGHT,
        gridColumn: `span ${cell.colSpan}`,
      }}
    >
      <div className="mx-auto flex min-w-0 max-w-full items-center justify-center gap-1.5 overflow-hidden">
        <span className="min-w-0 truncate">{cell.label}</span>
        {expandable ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 text-muted-foreground"
            aria-label={`${collapsed ? "Expand" : "Collapse"} ${cell.label}`}
            onClick={() => onToggleColumnPath(cell.columnPath)}
          >
            {collapsed ? (
              <ChevronRight className="size-3.5" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MatrixValueCell({
  row,
  column,
}: {
  row: MatrixGridRow;
  column: MatrixGridColumn;
}) {
  const cell = row.cells.find((candidate) => candidate.columnId === column.id);
  const value = formatMatrixCell(cell);
  return (
    <div
      role="cell"
      className={cn(
        "relative z-0 flex min-h-11 items-center justify-end overflow-hidden border-r px-3 py-2 text-right font-mono text-sm tabular-nums",
        cell?.role !== "value" && "bg-muted/20 font-semibold",
        cell?.presence !== "present" && "text-muted-foreground",
      )}
    >
      <span className="truncate">{value}</span>
    </div>
  );
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: "asc" | "desc";
  onClick?: () => void;
}) {
  if (!onClick) return <span className="truncate">{label}</span>;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="ml-auto h-7 min-w-0 px-2 text-xs"
      onClick={onClick}
    >
      <span className="truncate">{label}</span>
      {active === "asc" ? (
        <ArrowUp className="size-3.5 shrink-0" aria-hidden />
      ) : active === "desc" ? (
        <ArrowDown className="size-3.5 shrink-0" aria-hidden />
      ) : null}
    </Button>
  );
}

function nextSort(
  current: MatrixTableSort | undefined,
  axis: MatrixTableSort["axis"],
  targetId: string,
): MatrixTableSort | undefined {
  if (current?.axis !== axis || current.targetId !== targetId) {
    return { axis, targetId, direction: "desc" };
  }
  if (current.direction === "desc") return { axis, targetId, direction: "asc" };
  return undefined;
}

function formatMatrixCell(cell: MatrixGridCell | undefined): string {
  if (!cell || cell.presence !== "present") return "-";
  if (cell.formattedValue) return cell.formattedValue;
  if (typeof cell.rawValue === "number") {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(cell.rawValue);
  }
  return String(cell.rawValue ?? "-");
}

function projectVisibleMatrixGrid({
  grid,
  collapsedRowPathKeys,
  collapsedColumnPathKeys,
}: {
  grid: MatrixGridProjection;
  collapsedRowPathKeys: Set<string>;
  collapsedColumnPathKeys: Set<string>;
}): MatrixGridProjection {
  const columns = grid.columns.filter((column) =>
    isMatrixColumnVisible(column, collapsedColumnPathKeys),
  );
  const visibleColumnIds = new Set(columns.map((column) => column.id));

  return {
    ...grid,
    columns,
    columnHeaderRows: projectVisibleHeaderRows({
      headerRows: grid.columnHeaderRows,
      columns,
      collapsedColumnPathKeys,
    }),
    rows: grid.rows
      .filter((row) => isMatrixRowVisible(row, collapsedRowPathKeys))
      .map((row) => ({
        ...row,
        isExpanded: row.hasChildren
          ? !isRowCollapsed(row, collapsedRowPathKeys)
          : row.isExpanded,
        cells: row.cells.filter((cell) => visibleColumnIds.has(cell.columnId)),
      })),
  };
}

function projectVisibleHeaderRows({
  headerRows,
  columns,
  collapsedColumnPathKeys,
}: {
  headerRows: MatrixHeaderRow[];
  columns: MatrixGridColumn[];
  collapsedColumnPathKeys: Set<string>;
}): MatrixHeaderRow[] {
  return headerRows
    .map((headerRow) => ({
      ...headerRow,
      cells: headerRow.cells
        .filter((cell) =>
          shouldRenderHeaderCell(cell, columns, collapsedColumnPathKeys),
        )
        .map((cell) => ({
          ...cell,
          colSpan: Math.max(1, countColumnsForHeaderCell(cell, columns)),
        })),
    }))
    .filter((headerRow) => headerRow.cells.length > 0);
}

function shouldRenderHeaderCell(
  cell: MatrixHeaderCell,
  columns: MatrixGridColumn[],
  collapsedColumnPathKeys: Set<string>,
) {
  if (!cell.columnPath.length) return true;
  if (isHiddenByCollapsedAncestor(cell.columnPath, collapsedColumnPathKeys)) {
    return false;
  }
  return countColumnsForHeaderCell(cell, columns) > 0;
}

function countColumnsForHeaderCell(
  cell: MatrixHeaderCell,
  columns: MatrixGridColumn[],
) {
  if (cell.role !== "columnHeader") {
    return columns.filter((column) =>
      pathsEqual(column.columnPath, cell.columnPath),
    ).length;
  }

  return columns.filter((column) =>
    pathStartsWith(column.columnPath, cell.columnPath),
  ).length;
}

function isMatrixRowVisible(
  row: MatrixGridRow,
  collapsedRowPathKeys: Set<string>,
) {
  for (let index = 1; index < row.rowPath.length; index += 1) {
    if (collapsedRowPathKeys.has(matrixPathKey(row.rowPath.slice(0, index)))) {
      return false;
    }
  }
  return true;
}

function isMatrixColumnVisible(
  column: MatrixGridColumn,
  collapsedColumnPathKeys: Set<string>,
) {
  for (let index = 1; index <= column.columnPath.length; index += 1) {
    const prefix = column.columnPath.slice(0, index);
    const prefixKey = matrixPathKey(prefix);
    if (!collapsedColumnPathKeys.has(prefixKey)) continue;
    return (
      column.role !== "value" && matrixPathKey(column.columnPath) === prefixKey
    );
  }
  return true;
}

function isHiddenByCollapsedAncestor(
  path: MatrixPathSegment[],
  collapsedColumnPathKeys: Set<string>,
) {
  for (let index = 1; index < path.length; index += 1) {
    if (collapsedColumnPathKeys.has(matrixPathKey(path.slice(0, index)))) {
      return true;
    }
  }
  return false;
}

function isHeaderCellExpandable(
  cell: MatrixHeaderCell,
  columns: MatrixGridColumn[],
) {
  if (cell.role !== "columnHeader") return false;
  if (!cell.columnPath.length) return false;
  const hasDescendantColumns = columns.some(
    (column) =>
      column.columnPath.length > cell.columnPath.length &&
      pathStartsWith(column.columnPath, cell.columnPath),
  );
  const hasCollapsedSummaryColumn = columns.some(
    (column) =>
      column.role !== "value" && pathsEqual(column.columnPath, cell.columnPath),
  );
  return hasDescendantColumns && hasCollapsedSummaryColumn;
}

function getExpandableColumnPathKeys(grid: MatrixGridProjection) {
  const keys = new Set<string>();
  for (const headerRow of grid.columnHeaderRows) {
    for (const cell of headerRow.cells) {
      if (!isHeaderCellExpandable(cell, grid.columns)) continue;
      keys.add(matrixPathKey(cell.columnPath));
    }
  }
  return Array.from(keys);
}

function isRowCollapsed(
  row: MatrixGridRow,
  collapsedRowPathKeys: Set<string>,
) {
  return collapsedRowPathKeys.has(matrixPathKey(row.rowPath));
}

function isColumnPathCollapsed(
  path: MatrixPathSegment[],
  collapsedColumnPathKeys: Set<string>,
) {
  return collapsedColumnPathKeys.has(matrixPathKey(path));
}

function pathStartsWith(path: MatrixPathSegment[], prefix: MatrixPathSegment[]) {
  return prefix.every((segment, index) => {
    const candidate = path[index];
    return (
      candidate &&
      candidate.instanceId === segment.instanceId &&
      candidate.value === segment.value
    );
  });
}

function pathsEqual(left: MatrixPathSegment[], right: MatrixPathSegment[]) {
  return left.length === right.length && pathStartsWith(left, right);
}

function matrixPathKey(path: MatrixPathSegment[]) {
  return path
    .map((segment) => `${segment.instanceId}:${String(segment.value)}`)
    .join("/");
}

function toggleSetValue(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function matrixResultToGridProjection(result: MatrixResult): MatrixGridProjection {
  const columns = result.layout.columns;
  const cellByCoordinate = new Map(
    result.cells.map((cell) => [
      matrixCellKey(cell.rowId, cell.columnId, cell.measureId),
      cell,
    ]),
  );

  return {
    schemaVersion: 1,
    shape: result.shape,
    rowHeaderLevels: result.layout.rowHeaderLevels,
    columnHeaderRows: result.layout.columnHeaderRows,
    columns,
    rows: result.axes.rows.nodeIds
      .map((rowNodeId) => result.nodesById[rowNodeId])
      .filter((node): node is NonNullable<typeof node> => Boolean(node))
      .map((node) => ({
        id: `matrix-row:${node.id}`,
        rowNodeId: node.id,
        rowPath: node.path,
        depth: node.level,
        label: node.label,
        role: node.isGrandTotal
          ? "rowGrandTotal"
          : node.isSubtotal
            ? "rowSubtotal"
            : "value",
        hasChildren: node.hasChildren,
        isExpanded: node.isExpanded,
        cells: columns.map((column) => {
          const resultCell = cellByCoordinate.get(
            matrixCellKey(node.id, column.columnNodeId, column.measureInstanceId),
          );
          return {
            id: `matrix-cell:${node.id}:${column.id}`,
            columnId: column.id,
            rawValue: resultCell?.value ?? null,
            formattedValue: resultCell?.formattedValue,
            presence: resultCell?.presence ?? "missing",
            role: resultCell?.role ?? "value",
            measureInstanceId: column.measureInstanceId,
          };
        }),
      })),
  };
}

function matrixCellKey(
  rowId: string,
  columnId: string | undefined,
  measureId: string,
) {
  return `${rowId}::${columnId ?? ""}::${measureId}`;
}
