import assert from "node:assert/strict";
import test from "node:test";
import { PaySharp } from "../dist/index.js";

const order = {
  orderId: "order-1",
  amount: 1,
  customerId: "customer-1",
  customerMobileNo: "9111100000",
  remarks: "order-1",
};

function createRecorder() {
  const calls = [];
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test/root/",
    maxRetries: 0,
    fetch: async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ code: 200, message: "success", data: {} }), {
        headers: { "content-type": "application/json" },
      });
    },
  });
  return { calls, client };
}

const cases = [
  ["UPI intent", "POST", "/order/intent", client => client.upi.createIntent(order)],
  ["UPI QR", "POST", "/order/qrcode", client => client.upi.createQrCode(order)],
  ["offline UPI QR", "POST", "/order/dynamic-qrcode", client => client.upi.createOfflineDynamicQr(order)],
  ["UPI collect", "POST", "/order/request", client => client.upi.createCollectRequest({ ...order, customerVPA: "customer@bank" })],
  ["order status", "GET", "/order/order%2F1", client => client.upi.getOrder("order/1")],
  ["VPA validation", "POST", "/vpa/validate", client => client.upi.validateVpa("customer@bank")],
  ["refund creation", "POST", "/refunds", client => client.refunds.create({ paysharpReferenceNo: "payment-1", refundType: "FULL" })],
  ["refund history", "GET", "/refunds/payment-1", client => client.refunds.list("payment-1")],
  ["refund status", "GET", "/refunds/payment-1/refund-1", client => client.refunds.get("payment-1", "refund-1")],
  ["dispute creation", "POST", "/dispute", client => client.refunds.createDispute({ complaintReceivedDate: "2026-01-01T00:00:00Z", holdAmount: 1, complaintDetails: "Customer report", complaintReceivedFrom: "support" })],
  ["dispute closure", "GET", "/close/hold-1", client => client.refunds.closeDispute("hold-1")],
  ["payment-link creation", "POST", "/linkpayment", client => client.paymentLinks.create({ amount: 1, remarks: "invoice-1", validity: 24, customerName: "Ram", customerMobileNo: "9111100000" })],
  ["payment-link status", "GET", "/linkpayment/link-1", client => client.paymentLinks.get("link-1")],
  ["payment-link resend", "POST", "/linkpayment/resend", client => client.paymentLinks.resend({ linkPaymentId: "link-1", sendSms: true })],
  ["virtual-account creation", "POST", "/customers", client => client.virtualAccounts.create({ externalCustomerId: "customer-1", mobileNo: "9111100000" })],
  ["virtual-account update", "PUT", "/customers/customer-1", client => client.virtualAccounts.update("customer-1", { mobileNo: "9111100000" })],
  ["virtual-account lookup", "GET", "/customers/customer-1", client => client.virtualAccounts.get("customer-1")],
  ["virtual-account deactivation", "DELETE", "/customers/customer-1", client => client.virtualAccounts.deactivate("customer-1")],
  ["virtual-account reactivation", "POST", "/customers/reactivate", client => client.virtualAccounts.reactivate("customer-1")],
  ["virtual-account transaction", "GET", "/transactions/payment-1", client => client.virtualAccounts.getTransaction("payment-1")],
  ["settlement lookup", "GET", "/settlements/settlement-1", client => client.settlements.get("settlement-1")],
  ["settlement file", "GET", "/settlements/settlement-1/file", client => client.settlements.getFile("settlement-1")],
  ["settlement date listing", "GET", "/settlements/list/2026-01-01T00%3A00%3A00Z", client => client.settlements.listByDate("2026-01-01T00:00:00Z")],
];

test("all documented resource methods map to their v1 endpoints", async t => {
  for (const [name, method, path, invoke] of cases) {
    await t.test(name, async () => {
      const { calls, client } = createRecorder();
      await invoke(client);
      assert.equal(calls.length, 1);
      assert.equal(calls[0].init.method, method);
      assert.equal(calls[0].url, `https://api.example.test/root${path}`);
    });
  }
});

test("resource methods serialize request bodies as JSON", async () => {
  const { calls, client } = createRecorder();
  await client.virtualAccounts.reactivate("customer-1");
  assert.deepEqual(JSON.parse(calls[0].init.body), { externalCustomerId: "customer-1" });
  assert.equal(calls[0].init.headers["content-type"], "application/json");
});
