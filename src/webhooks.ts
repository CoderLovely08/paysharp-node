import type { PaySharpWebhook } from "./types.js";

export function parseWebhook(payload: string | Uint8Array | unknown): PaySharpWebhook {
  const value = typeof payload === "string"
    ? JSON.parse(payload) as unknown
    : payload instanceof Uint8Array
      ? JSON.parse(new TextDecoder().decode(payload)) as unknown
      : payload;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Webhook payload must be a JSON object");
  return value as PaySharpWebhook;
}

export function webhookAcknowledgement(): { code: 200; message: "success" } {
  return { code: 200, message: "success" };
}
