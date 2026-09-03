import type { PaySharpErrorBody } from "./types.js";

export class PaySharpError extends Error {
  readonly status: number;
  readonly code?: number | string;
  readonly requestId?: string;
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

export class PaySharpTimeoutError extends Error {
  constructor(readonly timeoutMs: number) {
    super(`PaySharp request timed out after ${timeoutMs}ms`);
    this.name = "PaySharpTimeoutError";
  }
}

export class PaySharpValidationError extends TypeError {
  constructor(message: string) { super(message); this.name = "PaySharpValidationError"; }
}
