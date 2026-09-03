import assert from "node:assert/strict";
import test from "node:test";
import {
  getWebhookKind,
  isPaymentWebhook,
  isRefundWebhook,
  isSettlementWebhook,
  isVirtualAccountWebhook,
  parseWebhook,
} from "../dist/index.js";

const payment = { orderId: "order-1", paysharpReferenceNo: "payment-1", status: "SUCCESS" };
const refund = { paysharpReferenceNo: "payment-1", refundPaysharpReferenceNo: "refund-1" };
const settlement = { settlementId: "settlement-1", settlementDate: "2026-01-01T00:00:00Z" };
const virtualAccount = { externalCustomerId: "customer-1", virtualAccountNo: "123", paysharpReferenceNo: "payment-1" };

test("classifies every documented webhook family", () => {
  assert.equal(getWebhookKind(payment), "payment");
  assert.equal(getWebhookKind(refund), "refund");
  assert.equal(getWebhookKind(settlement), "settlement");
  assert.equal(getWebhookKind(virtualAccount), "virtual-account");
  assert.equal(getWebhookKind({ arbitrary: true }), "unknown");
});

test("exposes focused webhook type guards", () => {
  assert.equal(isPaymentWebhook(payment), true);
  assert.equal(isRefundWebhook(refund), true);
  assert.equal(isSettlementWebhook(settlement), true);
  assert.equal(isVirtualAccountWebhook(virtualAccount), true);
  assert.equal(isPaymentWebhook(refund), false);
});

test("parses UTF-8 webhook bytes", () => {
  const bytes = new TextEncoder().encode(JSON.stringify(payment));
  assert.deepEqual(parseWebhook(bytes), payment);
});

test("rejects non-object webhook payloads", () => {
  assert.throws(() => parseWebhook("[]"), /JSON object/);
  assert.throws(() => parseWebhook("null"), /JSON object/);
  assert.throws(() => parseWebhook("{}"), /does not match/);
});
