import assert from "node:assert/strict";
import test from "node:test";
import { PaySharp, PaySharpValidationError } from "../dist/index.js";

const client = new PaySharp({
  token: "token",
  baseUrl: "https://api.example.test",
  fetch: async () => { throw new Error("validation should prevent the request"); },
});

test("requires an amount for partial refunds", () => {
  assert.throws(
    () => client.refunds.create({ paysharpReferenceNo: "payment-1", refundType: "PARTIAL" }),
    PaySharpValidationError,
  );
});

test("rejects unsupported refund types at runtime", () => {
  assert.throws(
    () => client.refunds.create({ paysharpReferenceNo: "payment-1", refundType: "CASH" }),
    /refundType must be one of: FULL, PARTIAL/,
  );
});

test("enforces documented payment-link validity", () => {
  const input = {
    amount: 1,
    remarks: "invoice",
    validity: 1441,
    customerName: "Ram",
    customerMobileNo: "9111100000",
  };
  assert.throws(() => client.paymentLinks.create(input), PaySharpValidationError);
});

test("requires at least one payment-link resend channel", () => {
  assert.throws(
    () => client.paymentLinks.resend({ linkPaymentId: "link-1" }),
    PaySharpValidationError,
  );
});

test("limits virtual accounts to five whitelisted remitters", () => {
  const remitter = { accountName: "ABC Corp", accountNo: "1234", ifscCode: "BANK0000001" };
  assert.throws(
    () => client.virtualAccounts.create({
      externalCustomerId: "customer-1",
      mobileNo: "9111100000",
      whitelistedRemitters: Array.from({ length: 6 }, () => remitter),
    }),
    /whitelistedRemitters must contain at most 5 items/,
  );
});

test("validates optional dispute contact numbers", () => {
  assert.throws(
    () => client.refunds.createDispute({
      complaintReceivedDate: "2026-01-01T00:00:00Z",
      holdAmount: 1,
      complaintDetails: "Customer report",
      complaintReceivedFrom: "support",
      complaintContactNo: "not-a-phone",
    }),
    /complaintContactNo must contain 8 to 15 digits/,
  );
});

test("rejects empty resource identifiers", () => {
  assert.throws(() => client.upi.getOrder(""), PaySharpValidationError);
  assert.throws(() => client.paymentLinks.get(""), PaySharpValidationError);
  assert.throws(() => client.virtualAccounts.get(""), PaySharpValidationError);
  assert.throws(() => client.settlements.get(""), PaySharpValidationError);
});
