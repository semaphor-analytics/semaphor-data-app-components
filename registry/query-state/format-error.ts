export function formatSemaphorError(error: unknown): string {
  if (!error) return "Something went wrong while loading this view.";
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Something went wrong while loading this view.";
}

