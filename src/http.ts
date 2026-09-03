import { PaySharpError, PaySharpTimeoutError } from "./errors.js";
import type { Fetch, PaySharpConfig, PaySharpEnvelope, PaySharpErrorBody, RequestOptions } from "./types.js";

type Method = "GET" | "POST" | "PUT" | "DELETE";
export interface RawRequest { method: Method; path: string; body?: unknown; options?: RequestOptions; }

const delay = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
});

export class HttpClient {
  private readonly fetcher: Fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(private readonly config: PaySharpConfig) {
    if (!config.token?.trim()) throw new TypeError("token is required");
    if (!config.baseUrl?.trim()) throw new TypeError("baseUrl is required");
    this.fetcher = config.fetch ?? globalThis.fetch;
    if (!this.fetcher) throw new TypeError("A Fetch implementation is required");
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.maxRetries = Math.max(0, config.maxRetries ?? 2);
  }

  async request<T>({ method, path, body, options }: RawRequest): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? this.timeoutMs;
    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(new PaySharpTimeoutError(timeoutMs)), timeoutMs);
      const abort = () => controller.abort(options?.signal?.reason);
      options?.signal?.addEventListener("abort", abort, { once: true });
      try {
        const response = await this.fetcher(`${this.baseUrl}${path}`, {
          method,
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": `Bearer ${this.config.token}`,
            ...(this.config.userAgent ? { "user-agent": this.config.userAgent } : {})
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: controller.signal
        });
        const text = await response.text();
        let payload: PaySharpEnvelope<T> | PaySharpErrorBody | undefined;
        try { payload = text ? JSON.parse(text) as PaySharpEnvelope<T> | PaySharpErrorBody : undefined; } catch { /* handled below */ }
        if (!response.ok || !payload || !("data" in payload)) {
          const details = payload as PaySharpErrorBody | undefined;
          const retryable = method === "GET" && (response.status === 429 || response.status >= 500) && attempt < this.maxRetries;
          if (retryable) {
            const retryAfter = Number(response.headers.get("retry-after"));
            await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt, options?.signal);
            continue;
          }
          const requestId = response.headers.get("x-request-id") ?? undefined;
          throw new PaySharpError(details?.message ?? `PaySharp request failed with HTTP ${response.status}`, {
            status: response.status,
            ...(details?.errorCode !== undefined ? { code: details.errorCode } : {}),
            ...(requestId ? { requestId } : {}),
            ...(details ? { details } : {})
          });
        }
        return (payload as PaySharpEnvelope<T>).data;
      } catch (error) {
        if (controller.signal.aborted && !options?.signal?.aborted) {
          const reason = controller.signal.reason;
          throw reason instanceof PaySharpTimeoutError ? reason : new PaySharpTimeoutError(timeoutMs);
        }
        throw error;
      } finally {
        clearTimeout(timeout);
        options?.signal?.removeEventListener("abort", abort);
      }
    }
  }
}

export const segment = (value: string) => encodeURIComponent(value);
