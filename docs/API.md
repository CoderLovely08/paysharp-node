# API reference

All operations are available from an initialized `PaySharp` client. The final `options` argument accepted by every method is optional:

```ts
interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}
```

Methods return the typed `data` field from PaySharp's response envelope. HTTP and API errors throw `PaySharpError`.

## Client configuration

```ts
const client = new PaySharp({
  token: "merchant-api-token",
  baseUrl: "merchant-environment-base-url",
  timeoutMs: 30_000, // optional
  maxRetries: 2,     // optional; GET requests only
  fetch,             // optional custom Fetch implementation
  userAgent: "my-service/1.0", // optional
});
```

`token` and `baseUrl` are required. PaySharp supplies different values for sandbox and production. A trailing slash in `baseUrl` is accepted and normalized.

## UPI

| SDK method | HTTP endpoint | Returns |
| --- | --- | --- |
| `upi.createIntent(input)` | `POST /order/intent` | `IntentOrder` |
| `upi.createQrCode(input)` | `POST /order/qrcode` | `QrOrder` |
| `upi.createOfflineDynamicQr(input)` | `POST /order/dynamic-qrcode` | `QrOrder` |
| `upi.createCollectRequest(input)` | `POST /order/request` | `CollectOrder` |
| `upi.getOrder(orderId)` | `GET /order/{orderId}` | `OrderStatus` |
| `upi.validateVpa(customerVPA)` | `POST /vpa/validate` | `VpaValidation` |

Intent, QR, and offline QR operations accept:

```ts
interface OrderInput {
  orderId: string;             // maximum 36 characters
  amount: number;              // minimum 1
  customerId: string;          // maximum 36 characters
  customerName?: string;       // maximum 100 characters
  customerMobileNo: string;    // exactly 10 digits
  customerEmail?: string;      // maximum 100 characters
  remarks: string;             // maximum 35 characters
}
```

`createCollectRequest` additionally requires `customerVPA`.

## Refunds and disputes

| SDK method | HTTP endpoint | Returns |
| --- | --- | --- |
| `refunds.create(input)` | `POST /refunds` | `RefundCreated` |
| `refunds.list(paysharpReferenceNo)` | `GET /refunds/{reference}` | `RefundHistory` |
| `refunds.get(reference, refundReference)` | `GET /refunds/{reference}/{refundReference}` | `RefundDetails` |
| `refunds.createDispute(input)` | `POST /dispute` | `Dispute` |
| `refunds.closeDispute(holdId)` | `GET /close/{holdId}` | `Dispute` |

For full refunds, omit `refundAmount`. Partial refunds require a positive `refundAmount`:

```ts
await client.refunds.create({
  paysharpReferenceNo: "upi_reference",
  refundType: "PARTIAL",
  refundAmount: 100,
});
```

PaySharp currently documents refunds as available within 90 days of a successful original transaction. Availability is controlled by the merchant account.

## Payment links

| SDK method | HTTP endpoint | Returns |
| --- | --- | --- |
| `paymentLinks.create(input)` | `POST /linkpayment` | `PaymentLink` |
| `paymentLinks.get(linkPaymentId)` | `GET /linkpayment/{linkPaymentId}` | `PaymentLink` |
| `paymentLinks.resend(input)` | `POST /linkpayment/resend` | `PaymentLinkResent` |

Validity is expressed in hours and must be an integer from 1 through 1440. Resending requires at least one of `sendEmail`, `sendSms`, or `sendWhatsApp` to be `true`.

## Virtual accounts

| SDK method | HTTP endpoint | Returns |
| --- | --- | --- |
| `virtualAccounts.create(input)` | `POST /customers` | `VirtualAccount` |
| `virtualAccounts.update(customerId, input)` | `PUT /customers/{customerId}` | `VirtualAccount` |
| `virtualAccounts.get(customerId)` | `GET /customers/{customerId}` | `VirtualAccount` |
| `virtualAccounts.deactivate(customerId)` | `DELETE /customers/{customerId}` | `VirtualAccount` |
| `virtualAccounts.reactivate(customerId)` | `POST /customers/reactivate` | `VirtualAccount` |
| `virtualAccounts.getTransaction(reference)` | `GET /transactions/{reference}` | `VirtualAccountTransaction` |

Up to five remitter bank accounts can be supplied through `whitelistedRemitters`:

```ts
interface WhitelistedRemitter {
  accountName: string;
  accountNo: string;
  ifscCode: string;
}
```

## Settlements

| SDK method | HTTP endpoint | Returns |
| --- | --- | --- |
| `settlements.get(settlementId)` | `GET /settlements/{settlementId}` | `Settlement` |
| `settlements.getFile(settlementId)` | `GET /settlements/{settlementId}/file` | `SettlementFile` |
| `settlements.listByDate(date)` | `GET /settlements/list/{date}` | `SettlementListItem` or `SettlementListItem[]` |

Settlement file URLs expire after one hour according to PaySharp's documentation. Retrieve a fresh URL immediately before downloading the file.

## Webhooks

`parseWebhook` accepts a JSON string, a `Uint8Array`, or an already parsed value and returns a `PaySharpWebhook`. `webhookAcknowledgement()` returns the response body PaySharp documents:

```json
{ "code": 200, "message": "success" }
```

The public API documentation does not describe a signature header or verification algorithm. `parseWebhook` therefore parses payloads but does not claim to authenticate them. Apply network restrictions supported by your merchant configuration and process events idempotently.

## Errors

`PaySharpError` exposes:

- `status`: HTTP status
- `code`: PaySharp error code when returned
- `requestId`: `x-request-id` response header when returned
- `details`: parsed error body when available

`PaySharpTimeoutError` contains the configured timeout. `PaySharpValidationError` indicates that the SDK rejected an invalid request before sending it.

Only GET requests retry automatically, and only for HTTP 429 or 5xx responses. This prevents automatic duplication of payment-changing operations.
