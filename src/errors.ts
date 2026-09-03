import type { PaySharpErrorBody } from "./types.js";

/** Error returned when PaySharp responds with an unsuccessful HTTP or API response. */
export class PaySharpError extends Error {
  /** HTTP response status. */
  readonly status: number;
  /** PaySharp-specific error code when present in the response body. */
  readonly code?: number | string;
  /** Request correlation ID when PaySharp returns an `x-request-id` header. */
  readonly requestId?: string;
  /** Parsed API error response for diagnostics. */
  readonly details?: PaySharpErrorBody;

  constructor(message: string, options: { status: number; code?: number | string; requestId?: string; details?: PaySharpErrorBody }) {
    super(message);
    this.name = "PaySharpError";
    this.status = options.status;
    if (options.code !== undefined) this.code = options.code;
    if (options.requestId !== undefined) this.requestId = options.requestId;
    if (options.details !== undefined) this.details = options.details;
  }
}

/** Error raised when a request exceeds its configured timeout. */
export class PaySharpTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`PaySharp request timed out after ${timeoutMs}ms`);
    this.name = "PaySharpTimeoutError";
  }
}

/** Error raised before network I/O when documented request constraints are violated. */
export class PaySharpValidationError extends TypeError {
  constructor(message: string) { super(message); this.name = "PaySharpValidationError"; }
}
