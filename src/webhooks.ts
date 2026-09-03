import type { PaySharpWebhook } from "./types.js";

/**
 * Parses a webhook body into the documented PaySharp webhook union.
 *
 * This helper does not authenticate the webhook: the public v1 documentation
 * does not currently specify a signature algorithm or signature header.
 */
export function parseWebhook(payload: string | Uint8Array | unknown): PaySharpWebhook {
  const value = typeof payload === "string"
    ? JSON.parse(payload) as unknown
    : payload instanceof Uint8Array
      ? JSON.parse(new TextDecoder().decode(payload)) as unknown
      : payload;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Webhook payload must be a JSON object");
  return value as PaySharpWebhook;
}

/** Builds the HTTP 200 JSON body expected by PaySharp webhook deliveries. */
export function webhookAcknowledgement(): { code: 200; message: "success" } {
  return { code: 200, message: "success" };
}
