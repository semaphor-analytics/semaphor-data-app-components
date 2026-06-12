import type { ReactNode } from "react";
import {
  AlertTriangle,
  Inbox,
  Lock,
  RotateCw,
  SearchX,
  ServerCrash,
  TimerOff,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { classifySemaphorError, type SemaphorErrorKind } from "./format-error";

export type QueryStateProps = {
  title?: string;
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onRetry?: () => void;
  loadingRows?: number;
  className?: string;
  children: ReactNode;
};

export function QueryState({
  title = "Data view",
  loading = false,
  error,
  empty = false,
  emptyTitle = "No rows found",
  emptyDescription = "Try changing the filters or time window.",
  emptyIcon,
  onRetry,
  loadingRows = 6,
  className,
  children,
}: QueryStateProps) {
  if (loading) {
    return <QueryStateSkeleton title={title} rows={loadingRows} className={className} />;
  }

  if (error) {
    return <QueryStateError title={title} error={error} onRetry={onRetry} className={className} />;
  }

  if (empty) {
    return (
      <QueryStateEmpty
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        className={className}
      />
    );
  }

  return children;
}

function QueryStateSkeleton({
  title,
  rows,
  className,
}: {
  title: string;
  rows: number;
  className?: string;
}) {
  // Column-width fractions designed to feel like a real data table without being
  // mechanical. First column wide (entity name), trailing columns narrower.
  const columnWidths = ["28%", "16%", "14%", "12%", "12%"];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`${title} loading`}
      className={cn("overflow-hidden rounded-md border bg-card", className)}
    >
      <div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-2.5">
        {columnWidths.map((width, index) => (
          <Skeleton
            key={index}
            data-shimmer
            style={{ width }}
            className="h-3 rounded-sm"
          />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-3 px-3 py-3">
            {columnWidths.map((width, colIndex) => (
              <Skeleton
                key={colIndex}
                data-shimmer
                style={{
                  width,
                  opacity: 1 - rowIndex * 0.06,
                }}
                className="h-3 rounded-sm"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function QueryStateError({
  title,
  error,
  onRetry,
  className,
}: {
  title: string;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const info = classifySemaphorError(error);

  return (
    <div
      role="alert"
      aria-label={`${title} failed to load`}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        {renderErrorIcon(info.kind)}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{info.title}</span>
        <p className="max-w-md text-xs text-muted-foreground">{info.message}</p>
      </div>
      {info.retryable && onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-1 gap-1.5">
          <RotateCw className="size-3.5" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

function QueryStateEmpty({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className,
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
        {icon ?? <Inbox className="size-4" aria-hidden />}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <p className="max-w-md text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function renderErrorIcon(kind: SemaphorErrorKind) {
  const className = "size-4";
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
