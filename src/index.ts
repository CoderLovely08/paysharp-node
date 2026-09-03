import { HttpClient } from "./http.js";
import { PaymentLinksResource, RefundsResource, SettlementsResource, UpiResource, VirtualAccountsResource } from "./resources.js";
import type { PaySharpConfig } from "./types.js";

/**
 * Server-side client for PaySharp's v1 REST APIs.
 *
 * @example
 * ```ts
 * const client = new PaySharp({
 *   token: process.env.PAYSHARP_TOKEN!,
 *   baseUrl: process.env.PAYSHARP_BASE_URL!,
 * });
 * const order = await client.upi.getOrder("ORDER-1001");
 * ```
 */
export class PaySharp {
  /** UPI orders, QR codes, collect requests, and VPA validation. */
  readonly upi: UpiResource;
  /** Refund and dispute operations. */
  readonly refunds: RefundsResource;
  /** Payment-link operations. */
  readonly paymentLinks: PaymentLinksResource;
  /** Virtual-account customer and transaction operations. */
  readonly virtualAccounts: VirtualAccountsResource;
  /** Settlement and reconciliation-file operations. */
  readonly settlements: SettlementsResource;

  constructor(config: PaySharpConfig) {
    const http = new HttpClient(config);
    this.upi = new UpiResource(http);
    this.refunds = new RefundsResource(http);
    this.paymentLinks = new PaymentLinksResource(http);
    this.virtualAccounts = new VirtualAccountsResource(http);
    this.settlements = new SettlementsResource(http);
  }
}

export { PaySharpError, PaySharpTimeoutError, PaySharpValidationError } from "./errors.js";
export {
  getWebhookKind,
  isPaymentWebhook,
  isRefundWebhook,
  isSettlementWebhook,
  isVirtualAccountWebhook,
  parseWebhook,
  webhookAcknowledgement,
} from "./webhooks.js";
export type * from "./types.js";
export default PaySharp;
