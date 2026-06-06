import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSemaphorError } from "./format-error";

export type QueryStateProps = {
  title?: string;
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  loadingRows?: number;
  children: ReactNode;
};

export function QueryState({
  title = "Data view",
  loading = false,
  error,
  empty = false,
  emptyTitle = "No rows found",
  emptyDescription = "Try changing the filters or time window.",
  onRetry,
  loadingRows = 6,
  children,
}: QueryStateProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={`${title} loading`}>
        {Array.from({ length: loadingRows }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{title} failed to load</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-3">
          <span>{formatSemaphorError(error)}</span>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center">
        <div className="text-sm font-medium">{emptyTitle}</div>
        <div className="max-w-md text-sm text-muted-foreground">{emptyDescription}</div>
      </div>
    );
  }

  return children;
}

