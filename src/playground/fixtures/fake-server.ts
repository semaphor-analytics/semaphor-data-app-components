import type {
  ServerDataTablePagination,
  ServerDataTableSort,
} from "../../../registry/server-data-table/view";
import {
  getDisplayedTotals,
  ordersRows,
  sortRows,
  type CampaignOrderRow,
} from "./records-fixtures";

export type FakeServerDataRequest = {
  page: number;
  pageSize: number;
  sort?: ServerDataTableSort;
  latencyMs?: number;
  errorMode?: "none" | "network" | "server";
  totalRowCount?: number;
};

export type FakeServerDataResponse = {
  rows: CampaignOrderRow[];
  pagination: ServerDataTablePagination;
  totalRow: Partial<CampaignOrderRow>;
};

export async function fetchFakeOrders({
  page,
  pageSize,
  sort,
  latencyMs = 0,
  errorMode = "none",
  totalRowCount = ordersRows.length,
}: FakeServerDataRequest): Promise<FakeServerDataResponse> {
  if (latencyMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, latencyMs));
  }

  if (errorMode === "network") throw new Error("Network request failed.");
  if (errorMode === "server") throw new Error("The server rejected this table query.");

  const boundedRows = ordersRows.slice(0, totalRowCount);
  const sortedRows = sortRows(boundedRows, sort);
  const start = (page - 1) * pageSize;
  const rows = sortedRows.slice(start, start + pageSize);
  const pageCount = Math.max(1, Math.ceil(boundedRows.length / pageSize));

  return {
    rows,
    totalRow: getDisplayedTotals(rows),
    pagination: {
      page,
      pageSize,
      totalRows: boundedRows.length,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    },
  };
}

