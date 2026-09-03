import { HttpClient } from "./http.js";
import { PaymentLinksResource, RefundsResource, SettlementsResource, UpiResource, VirtualAccountsResource } from "./resources.js";
import type { PaySharpConfig } from "./types.js";

export class PaySharp {
  readonly upi: UpiResource;
  readonly refunds: RefundsResource;
  readonly paymentLinks: PaymentLinksResource;
  readonly virtualAccounts: VirtualAccountsResource;
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
export { parseWebhook, webhookAcknowledgement } from "./webhooks.js";
export type * from "./types.js";
export default PaySharp;
