# Sandbox setup

## Prerequisites

1. Enable the required product in the PaySharp sandbox merchant dashboard.
2. Copy the sandbox API token and base URL from the dashboard configuration page.
3. Keep both values on the server. Do not include the token in browser bundles, mobile applications, logs, or committed files.

## Environment

```bash
export PAYSHARP_TOKEN="your-sandbox-token"
export PAYSHARP_BASE_URL="the-sandbox-base-url-from-your-dashboard"
```

PaySharp does not publish a single universal base URL in its public v1 documentation. Always use the exact value shown for the merchant environment.

## Run an example

```bash
node examples/create-upi-intent.mjs
```

Use a unique `orderId` for each run. The example generates one from the current timestamp.

## Test VPA values

PaySharp's public documentation lists dedicated VPA values for sandbox validation. Consult the current documentation or the Postman collection downloaded from the merchant dashboard because test values may change.

## Production checklist

- Switch both the token and base URL together.
- Confirm every enabled product and IP allowlist in the merchant dashboard.
- Store webhook events before acknowledging them and process them idempotently.
- Confirm current webhook verification guidance directly with PaySharp.
- Do not infer payment success from order creation; use a webhook or status lookup.
- Log PaySharp reference numbers and request IDs, but never authorization headers.
