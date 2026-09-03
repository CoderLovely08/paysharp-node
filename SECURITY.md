# Security policy

Payment SDK issues can affect credentials, transaction integrity, or customer data. Please report suspected vulnerabilities privately and do not open a public issue containing exploit details.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| Older releases | Best effort |

## Reporting a vulnerability

Use GitHub's **Security → Report a vulnerability** form for this repository. Include:

- the affected SDK version and Node.js version;
- the smallest reproducible example;
- the impact and conditions required to reproduce it;
- suggested remediation, if known.

Never include a real PaySharp token, private merchant base URL, customer information, production webhook payload, bank account number, or other payment data. Replace sensitive values with clearly marked test placeholders.

You should receive an acknowledgement within five business days. Confirmed issues will be assessed for severity, fixed on a private branch, and released with appropriate upgrade guidance. Public disclosure should wait until a patched release is available.

## Security model

- This is an unofficial SDK and is not a replacement for PaySharp's current merchant security guidance.
- API tokens are bearer credentials and must remain in trusted server-side environments.
- The SDK never logs tokens or response bodies by itself.
- Automatic retries are limited to GET requests to avoid duplicating payment-changing operations.
- The public PaySharp v1 documentation does not currently specify webhook signatures. The webhook parser does not authenticate events; deployments must use the controls supported by PaySharp and process events idempotently.
