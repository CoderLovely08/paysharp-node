# PaySharp Node.js SDK

An unofficial, TypeScript-first SDK covering PaySharp's publicly documented v1 APIs. It has no runtime dependencies and works with Node.js 18 or newer.

## Supported APIs

- UPI intent, dynamic QR, offline dynamic QR, collect request, order status, and VPA validation
- Full and partial refunds, refund history/status, and disputes
- Payment-link creation, status, and resend
- Virtual-account creation, update, lookup, deactivation/reactivation, and transaction lookup
- Settlement status, file URL, and date listing
- Typed webhook payloads, JSON parsing, and acknowledgement helpers

Some PaySharp products are limited-preview features and must be enabled on the merchant account.

## Install

```bash
npm install paysharp-node
```

## Configure

PaySharp provides separate API tokens and base URLs for sandbox and production in the merchant dashboard. Pass the exact URL supplied for the selected environment.

```ts
import { PaySharp } from "paysharp-node";

const paysharp = new PaySharp({
  token: process.env.PAYSHARP_TOKEN!,
  baseUrl: process.env.PAYSHARP_BASE_URL!,
  timeoutMs: 30_000,
});
```

Never expose the token in browser or mobile application code.

## UPI

```ts
const order = await paysharp.upi.createIntent({
  orderId: "ORDER-1001",
  amount: 500,
  customerId: "CUSTOMER-7",
  customerName: "Ram",
  customerMobileNo: "9111100000",
  customerEmail: "ram@example.com",
  remarks: "Invoice ORDER-1001",
});

const status = await paysharp.upi.getOrder("ORDER-1001");
const vpa = await paysharp.upi.validateVpa("customer@bank");
```

Other creation methods accept the same order fields:

```ts
await paysharp.upi.createQrCode(input);
await paysharp.upi.createOfflineDynamicQr(input);
await paysharp.upi.createCollectRequest({ ...input, customerVPA: "customer@bank" });
```

## Refunds

```ts
const refund = await paysharp.refunds.create({
  paysharpReferenceNo: "upi_reference",
  refundType: "PARTIAL",
  refundAmount: 100,
});

await paysharp.refunds.list("upi_reference");
await paysharp.refunds.get("upi_reference", refund.refundPaysharpReferenceNo);
```

## Payment links

```ts
const link = await paysharp.paymentLinks.create({
  amount: 500,
  remarks: "Invoice-1001",
  validity: 24,
  customerName: "Ram",
  customerMobileNo: "9111100000",
  customerEmail: "ram@example.com",
  sendEmail: true,
});
```

## Virtual accounts and settlements

```ts
const account = await paysharp.virtualAccounts.create({
  externalCustomerId: "CUSTOMER-7",
  name: "ABC Corp",
  mobileNo: "9111100000",
  email: "accounts@example.com",
});

const settlements = await paysharp.settlements.listByDate("2026-03-23T10:02:29+05:30");
```

## Errors and cancellation

```ts
import { PaySharpError } from "paysharp-node";

try {
  await paysharp.upi.getOrder("ORDER-1001", { timeoutMs: 5_000 });
} catch (error) {
  if (error instanceof PaySharpError) {
    console.error(error.status, error.code, error.message);
  }
}
```

GET requests retry HTTP 429 and 5xx responses by default. Mutating requests are never automatically retried because doing so could duplicate a payment operation. Pass an `AbortSignal` in any method's final options argument to cancel a request.

## Webhooks

```ts
import { parseWebhook, webhookAcknowledgement } from "paysharp-node";

const event = parseWebhook(rawRequestBody);
// Persist/process the event idempotently, then return:
res.status(200).json(webhookAcknowledgement());
```

The public v1 documentation does not specify a webhook signature scheme. Restrict webhook access using the controls available in your PaySharp account and infrastructure, and confirm current verification requirements with PaySharp before production use.

## Development

```bash
npm install
npm run check
npm test
```

The SDK returns the `data` member of PaySharp's `{ code, message, data }` response envelope and throws `PaySharpError` for API errors.
