import assert from "node:assert/strict";
import test from "node:test";
import { PaySharp, PaySharpError, PaySharpValidationError, parseWebhook, webhookAcknowledgement } from "../dist/index.js";

function mockClient(handler) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return handler(url, init);
  };
  return { calls, client: new PaySharp({ token: "test-token", baseUrl: "https://api.example.test/", fetch, maxRetries: 0 }) };
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

test("creates a UPI intent with authentication and unwraps data", async () => {
  const data = { paysharpReferenceNo: "ref", intentUrl: "upi://pay", phonepeUrl: "phonepe://pay", gpayUrl: "tez://pay", orderId: "o1", amount: 1, customerId: "c1", customerName: "Ram", customerMobileNo: "9111100000", customerEmail: "", remarks: "o1" };
  const { client, calls } = mockClient(() => json({ code: 200, message: "success", data }));
  assert.deepEqual(await client.upi.createIntent({ orderId: "o1", amount: 1, customerId: "c1", customerMobileNo: "9111100000", remarks: "o1" }), data);
  assert.equal(calls[0].url, "https://api.example.test/order/intent");
  assert.equal(calls[0].init.headers.authorization, "Bearer test-token");
  assert.equal(calls[0].init.method, "POST");
});

test("URL-encodes path parameters", async () => {
  const { client, calls } = mockClient(() => json({ code: 200, message: "success", data: { status: "PENDING" } }));
  await client.upi.getOrder("order/with spaces");
  assert.equal(calls[0].url, "https://api.example.test/order/order%2Fwith%20spaces");
});

test("throws a structured PaySharpError", async () => {
  const { client } = mockClient(() => json({ code: 400, errorCode: 6002, message: "order not found" }, 400, { "x-request-id": "req-1" }));
  await assert.rejects(client.upi.getOrder("missing"), error => {
    assert.ok(error instanceof PaySharpError);
    assert.equal(error.status, 400);
    assert.equal(error.code, 6002);
    assert.equal(error.requestId, "req-1");
    return true;
  });
});

test("validates high-risk request fields before network calls", async () => {
  const { client, calls } = mockClient(() => { throw new Error("should not be called"); });
  assert.throws(() => client.upi.createQrCode({ orderId: "o1", amount: 0, customerId: "c1", customerMobileNo: "123", remarks: "test" }), PaySharpValidationError);
  assert.equal(calls.length, 0);
});

test("parses webhooks and builds the required acknowledgement", () => {
  assert.equal(parseWebhook('{"status":"SUCCESS","orderId":"o1"}').status, "SUCCESS");
  assert.deepEqual(webhookAcknowledgement(), { code: 200, message: "success" });
});
