export type ErrorCode =
  | "INVALID_INPUT"
  | "MISSING_KEY"
  | "NOT_IN_GIT"
  | "NOT_FOUND"
  | "COMMAND"
  | "IO";

export class CtxlocError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function fail(code: ErrorCode, message: string): never {
  throw new CtxlocError(code, message);
}

export function formatError(err: unknown): string {
  if (err instanceof CtxlocError) {
    return `CTXLOC_ERR ${err.code}: ${err.message}`;
  }
  const message = err instanceof Error ? err.message : String(err);
  return `CTXLOC_ERR IO: ${message}`;
}
