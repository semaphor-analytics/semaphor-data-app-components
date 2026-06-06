import { useEffect, useMemo, useState } from "react";
import type { MatrixGridProjection } from "react-semaphor/data-app-sdk";
import { MatrixTableView } from "../../../registry/matrix-table/view";
import { campaignRevenueMatrix } from "../fixtures/matrix-fixtures";

export type MatrixTableExampleControls = {
  latencyMs: number;
  errorMode: "none" | "network" | "server";
};

export function MatrixTableBasicExample({
  latencyMs,
  errorMode,
}: MatrixTableExampleControls) {
  const requestKey = `${latencyMs}|${errorMode}`;
  const [state, setState] = useState<{
    requestKey: string;
    grid: MatrixGridProjection | undefined;
    error: unknown;
  }>({ requestKey: "", grid: campaignRevenueMatrix, error: null });

  const isCurrent = state.requestKey === requestKey;
  const loading = !isCurrent;
  const error = isCurrent ? state.error : null;

  useEffect(() => {
    let active = true;

    fetchFakeMatrix({ latencyMs, errorMode })
      .then((grid) => {
        if (!active) return;
        setState({ requestKey, grid, error: null });
      })
      .catch((nextError: unknown) => {
        if (!active) return;
        setState((current) => ({ requestKey, grid: current.grid, error: nextError }));
      });

    return () => {
      active = false;
    };
  }, [errorMode, latencyMs, requestKey]);

  const description = useMemo(
    () =>
      "Fixture-backed pivot using the same MatrixGridProjection shape returned by Semaphor matrix queries.",
    [],
  );

  return (
    <MatrixTableView
      title="Campaign revenue by customer segment"
      description={description}
      grid={state.grid}
      loading={loading}
      error={error}
      height={380}
    />
  );
}

function fetchFakeMatrix({
  latencyMs,
  errorMode,
}: MatrixTableExampleControls): Promise<MatrixGridProjection> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (errorMode === "network") {
        reject(new TypeError("Failed to fetch"));
        return;
      }
      if (errorMode === "server") {
        reject({ status: 500, message: "Matrix execution failed" });
        return;
      }
      resolve(campaignRevenueMatrix);
    }, latencyMs);
  });
}
