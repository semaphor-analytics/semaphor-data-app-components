import { useMemo, useState } from "react";
import {
  type SemaphorMatrixQueryDefinition,
  type SemaphorQueryRuntimeOptions,
  useSemaphorQuery,
} from "react-semaphor/data-app-sdk";
import {
  MatrixTableView,
  type MatrixTableViewProps,
} from "./view";
import type { MatrixTableSort } from "./core";

export type {
  MatrixGridCell,
  MatrixGridColumn,
  MatrixGridRow,
  MatrixHeaderCell,
  MatrixHeaderRow,
  MatrixPathSegment,
  MatrixResult,
} from "./core";

export type SemaphorMatrixTableQueryState = {
  sort?: MatrixTableSort;
};

export type SemaphorMatrixTableProps = Omit<
  MatrixTableViewProps,
  "grid" | "result" | "loading" | "error" | "sort" | "onSortChange"
> & {
  queryFactory: (state: SemaphorMatrixTableQueryState) => SemaphorMatrixQueryDefinition;
  options?: SemaphorQueryRuntimeOptions;
};

export function SemaphorMatrixTable({
  queryFactory,
  options,
  ...viewProps
}: SemaphorMatrixTableProps) {
  const [sort, setSort] = useState<MatrixTableSort | undefined>();
  const query = useMemo(() => queryFactory({ sort }), [queryFactory, sort]);
  const result = useSemaphorQuery(query, options);

  return (
    <MatrixTableView
      {...viewProps}
      grid={result.grid}
      result={result.matrixResult}
      loading={result.isLoading}
      error={result.error}
      sort={sort}
      onSortChange={setSort}
    />
  );
}

export { MatrixTableView };
export type { MatrixTableSort, MatrixTableViewProps };
