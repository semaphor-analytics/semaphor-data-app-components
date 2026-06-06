import { useEffect, useState } from "react";
import {
  ServerDataTableView,
  type ServerDataTableSort,
} from "../../../registry/server-data-table/server-data-table-view";
import { fetchFakeOrders, type FakeServerDataResponse } from "../fixtures/fake-server";
import { ordersColumns } from "../fixtures/records-fixtures";

export type ServerTableExampleControls = {
  pageSize: number;
  latencyMs: number;
  errorMode: "none" | "network" | "server";
  totalRowCount: number;
  onPageSizeChange?: (pageSize: number) => void;
};

export function ServerDataTableBasicExample({
  pageSize,
  latencyMs,
  errorMode,
  totalRowCount,
  onPageSizeChange,
}: ServerTableExampleControls) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ServerDataTableSort | undefined>({
    key: "revenue",
    direction: "desc",
  });
  const [response, setResponse] = useState<FakeServerDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchFakeOrders({ page, pageSize, sort, latencyMs, errorMode, totalRowCount })
      .then((nextResponse) => {
        if (!active) return;
        setResponse(nextResponse);
      })
      .catch((nextError: unknown) => {
        if (!active) return;
        setError(nextError);
        setResponse(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [errorMode, latencyMs, page, pageSize, sort, totalRowCount]);

  return (
    <ServerDataTableView
      title="Campaign orders"
      description="Fixture-backed example with server-owned pagination, sorting, loading, errors, totals, and bounded height."
      columns={ordersColumns}
      rows={response?.rows ?? []}
      pagination={response?.pagination ?? { page, pageSize, totalRows: 0 }}
      totalRow={response?.totalRow}
      sort={sort}
      loading={loading}
      error={error}
      height={380}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPage(1);
        setResponse(null);
        onPageSizeChange?.(nextPageSize);
      }}
      onSortChange={(nextSort) => {
        setSort(nextSort);
        setPage(1);
      }}
    />
  );
}
