export type SemaphorErrorKind =
  | "network"
  | "timeout"
  | "permission"
  | "not_found"
  | "server"
  | "unknown";

export type SemaphorErrorInfo = {
  kind: SemaphorErrorKind;
  title: string;
  message: string;
  retryable: boolean;
};

const KIND_TITLES: Record<SemaphorErrorKind, string> = {
  network: "Can't reach the server",
  timeout: "Request timed out",
  permission: "Access denied",
  not_found: "Nothing here",
  server: "Server error",
  unknown: "Something went wrong",
};

export function classifySemaphorError(error: unknown): SemaphorErrorInfo {
  const message = extractMessage(error);
  const status = extractStatus(error);
  const lower = message.toLowerCase();

  if (typeof status === "number") {
    if (status === 401 || status === 403) {
      return { kind: "permission", title: KIND_TITLES.permission, message, retryable: false };
    }
    if (status === 404) {
      return { kind: "not_found", title: KIND_TITLES.not_found, message, retryable: false };
    }
    if (status === 408 || status === 504) {
      return { kind: "timeout", title: KIND_TITLES.timeout, message, retryable: true };
    }
    if (status >= 500) {
      return { kind: "server", title: KIND_TITLES.server, message, retryable: true };
    }
  }

  if (
    error instanceof TypeError ||
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("offline") ||
    (typeof navigator !== "undefined" && navigator.onLine === false)
  ) {
    return { kind: "network", title: KIND_TITLES.network, message, retryable: true };
  }

  if (
    (error instanceof Error && error.name === "AbortError") ||
    lower.includes("timeout") ||
    lower.includes("timed out")
  ) {
    return { kind: "timeout", title: KIND_TITLES.timeout, message, retryable: true };
  }

  if (lower.includes("forbidden") || lower.includes("unauthorized") || lower.includes("denied")) {
    return { kind: "permission", title: KIND_TITLES.permission, message, retryable: false };
  }

  return { kind: "unknown", title: KIND_TITLES.unknown, message, retryable: true };
}

export function formatSemaphorError(error: unknown): string {
  return classifySemaphorError(error).message;
}

function extractMessage(error: unknown): string {
  if (!error) return "We couldn't complete this request.";
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (typeof error === "object" && error !== null) {
    const candidate = (error as { message?: unknown }).message;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "We couldn't complete this request.";
}

function extractStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const record = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
  if (typeof record.status === "number") return record.status;
  if (typeof record.statusCode === "number") return record.statusCode;
  if (record.response && typeof record.response.status === "number") return record.response.status;
  return undefined;
}
