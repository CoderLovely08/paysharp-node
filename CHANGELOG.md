# Changelog

All notable changes are documented here. The project follows [Semantic Versioning](https://semver.org/) and keeps changes grouped by release impact.

## Unreleased

### Added

- Complete API and sandbox documentation.
- Runnable UPI intent and Express webhook examples.
- TSDoc for public client, resource, error, and webhook APIs.
- Contract coverage for all 23 documented endpoint mappings.
- Retry, timeout, response-error, and request-validation tests.
- Cross-version CI for Node.js 18, 20, 22, and 24.
- Contribution templates, private vulnerability reporting, and dependency monitoring.

### Fixed

- Consistent runtime enforcement of documented identifier, amount, validity, contact-number, and remitter-list constraints.

## 0.1.0 - 2026-09-04

### Added

- Initial TypeScript-first SDK for PaySharp v1.
- UPI intent, QR, offline QR, collect request, order status, and VPA validation.
- Refund history/status and dispute operations.
- Payment-link creation, status, and resend.
- Virtual-account lifecycle and transaction lookup.
- Settlement status, file, and date-list operations.
- Typed errors, request cancellation, safe GET retries, and webhook helpers.
- ESM and CommonJS distributions with TypeScript declarations.
