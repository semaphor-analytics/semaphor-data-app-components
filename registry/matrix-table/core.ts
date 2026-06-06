import type {
  MatrixGridProjection,
  SemaphorMatrixQueryResult,
} from "react-semaphor/data-app-sdk";

export type MatrixResult = NonNullable<SemaphorMatrixQueryResult["matrixResult"]>;
export type MatrixGridRow = MatrixGridProjection["rows"][number];
export type MatrixGridColumn = MatrixGridProjection["columns"][number];
export type MatrixGridCell = MatrixGridRow["cells"][number];
export type MatrixHeaderRow = MatrixGridProjection["columnHeaderRows"][number];
export type MatrixHeaderCell = MatrixHeaderRow["cells"][number];
export type MatrixPathSegment = MatrixGridRow["rowPath"][number];

export const MATRIX_ROW_HEADER_WIDTH = 300;
export const MATRIX_DATA_COLUMN_WIDTH = 164;
export const MATRIX_HEADER_ROW_HEIGHT = 40;

export type MatrixTableSort = {
  axis: "row" | "column";
  targetId: string;
  direction: "asc" | "desc";
};

export function nextMatrixSort(
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

export function formatMatrixCell(cell: MatrixGridCell | undefined): string {
  if (!cell || cell.presence !== "present") return "-";
  if (cell.formattedValue) return cell.formattedValue;
  if (typeof cell.rawValue === "number") {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(cell.rawValue);
  }
  return String(cell.rawValue ?? "-");
}

export function projectVisibleMatrixGrid({
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

export function isHeaderCellExpandable(
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

export function getExpandableColumnPathKeys(grid: MatrixGridProjection) {
  const keys = new Set<string>();
  for (const headerRow of grid.columnHeaderRows) {
    for (const cell of headerRow.cells) {
      if (!isHeaderCellExpandable(cell, grid.columns)) continue;
      keys.add(matrixPathKey(cell.columnPath));
    }
  }
  return Array.from(keys);
}

export function isRowCollapsed(
  row: MatrixGridRow,
  collapsedRowPathKeys: Set<string>,
) {
  return collapsedRowPathKeys.has(matrixPathKey(row.rowPath));
}

export function isColumnPathCollapsed(
  path: MatrixPathSegment[],
  collapsedColumnPathKeys: Set<string>,
) {
  return collapsedColumnPathKeys.has(matrixPathKey(path));
}

export function matrixPathKey(path: MatrixPathSegment[]) {
  return path
    .map((segment) => `${segment.instanceId}:${String(segment.value)}`)
    .join("/");
}

export function toggleSetValue(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function matrixResultToGridProjection(
  result: MatrixResult,
): MatrixGridProjection {
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

function matrixCellKey(
  rowId: string,
  columnId: string | undefined,
  measureId: string,
) {
  return `${rowId}::${columnId ?? ""}::${measureId}`;
}
