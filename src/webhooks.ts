import type {
  PaymentWebhook,
  PaySharpWebhook,
  PaySharpWebhookKind,
  RefundWebhook,
  SettlementWebhook,
  VirtualAccountWebhook,
} from "./types.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Returns true when a callback has the documented payment webhook shape. */
export function isPaymentWebhook(payload: unknown): payload is PaymentWebhook {
  return isRecord(payload)
    && typeof payload.orderId === "string"
    && typeof payload.paysharpReferenceNo === "string"
    && typeof payload.status === "string";
}

/** Returns true when a callback has the documented refund webhook shape. */
export function isRefundWebhook(payload: unknown): payload is RefundWebhook {
  return isRecord(payload)
    && typeof payload.refundPaysharpReferenceNo === "string"
    && typeof payload.paysharpReferenceNo === "string";
}

/** Returns true when a callback has the documented settlement webhook shape. */
export function isSettlementWebhook(payload: unknown): payload is SettlementWebhook {
  return isRecord(payload)
    && typeof payload.settlementId === "string"
    && typeof payload.settlementDate === "string";
}

/** Returns true when a callback has the documented virtual-account webhook shape. */
export function isVirtualAccountWebhook(payload: unknown): payload is VirtualAccountWebhook {
  return isRecord(payload)
    && typeof payload.externalCustomerId === "string"
    && typeof payload.virtualAccountNo === "string"
    && typeof payload.paysharpReferenceNo === "string";
}

/** Classifies a parsed callback using fields unique to each documented product. */
export function getWebhookKind(payload: unknown): PaySharpWebhookKind {
  if (isRefundWebhook(payload)) return "refund";
  if (isSettlementWebhook(payload)) return "settlement";
  if (isVirtualAccountWebhook(payload)) return "virtual-account";
  if (isPaymentWebhook(payload)) return "payment";
  return "unknown";
}

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
  if (!isRecord(value)) throw new TypeError("Webhook payload must be a JSON object");
  if (isRefundWebhook(value) || isSettlementWebhook(value) || isVirtualAccountWebhook(value) || isPaymentWebhook(value)) {
    return value;
  }
  throw new TypeError("Webhook payload does not match a documented PaySharp event");
}

/** Builds the HTTP 200 JSON body expected by PaySharp webhook deliveries. */
export function webhookAcknowledgement(): { code: 200; message: "success" } {
  return { code: 200, message: "success" };
}
