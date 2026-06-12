import { useEffect, useMemo, useState } from "react";
import {
  ServerDataTableView,
  type ServerDataTableSort,
} from "../../../registry/server-data-table/view";
import { fetchDemoOrders, type DemoServerDataResponse } from "../demo-data/demo-server";
import { ordersColumns } from "../demo-data/records-demo-data";

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
  const request = useMemo(
    () => ({ page, pageSize, sort, latencyMs, errorMode, totalRowCount }),
    [errorMode, latencyMs, page, pageSize, sort, totalRowCount],
  );
  const requestKey = [
    page,
    pageSize,
    sort?.key ?? "",
    sort?.direction ?? "",
    latencyMs,
    errorMode,
    totalRowCount,
  ].join("|");
  const [state, setState] = useState<{
    requestKey: string;
    response: DemoServerDataResponse | null;
    error: unknown;
  }>({ requestKey: "", response: null, error: null });

  const isCurrent = state.requestKey === requestKey;
  const response = state.response;
  const error = isCurrent ? state.error : null;
  const loading = !isCurrent;

  useEffect(() => {
    let active = true;

    fetchDemoOrders(request)
      .then((nextResponse) => {
        if (!active) return;
        setState({ requestKey, response: nextResponse, error: null });
      })
      .catch((nextError: unknown) => {
        if (!active) return;
        setState((current) => ({ requestKey, response: current.response, error: nextError }));
      });

    return () => {
      active = false;
    };
  }, [request, requestKey]);

  return (
    <ServerDataTableView
      title="Campaign orders"
      description="Demo data example with server-owned pagination, sorting, loading, errors, totals, and bounded height."
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
        onPageSizeChange?.(nextPageSize);
      }}
      onSortChange={(nextSort) => {
        setSort(nextSort);
        setPage(1);
      }}
    />
  );
}
