import assert from "node:assert/strict";
import test from "node:test";
import { PaySharp, PaySharpError, PaySharpTimeoutError } from "../dist/index.js";

const success = data => new Response(JSON.stringify({ code: 200, message: "success", data }), {
  headers: { "content-type": "application/json" },
});

test("retries a retryable GET response", async () => {
  let attempts = 0;
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test",
    maxRetries: 2,
    fetch: async () => {
      attempts += 1;
      return attempts === 1
        ? new Response(JSON.stringify({ code: 503, message: "unavailable" }), { status: 503 })
        : success({ orderId: "order-1", status: "PENDING" });
    },
  });

  assert.equal((await client.upi.getOrder("order-1")).status, "PENDING");
  assert.equal(attempts, 2);
});

test("does not retry mutating requests", async () => {
  let attempts = 0;
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test",
    fetch: async () => {
      attempts += 1;
      return new Response(JSON.stringify({ code: 503, message: "unavailable" }), { status: 503 });
    },
  });

  await assert.rejects(client.upi.validateVpa("customer@bank"), PaySharpError);
  assert.equal(attempts, 1);
});

test("honors per-request timeout overrides", async () => {
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test",
    timeoutMs: 1_000,
    fetch: async (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true });
    }),
  });

  await assert.rejects(client.upi.getOrder("order-1", { timeoutMs: 5 }), error => {
    assert.ok(error instanceof PaySharpTimeoutError);
    assert.equal(error.timeoutMs, 5);
    return true;
  });
});

test("handles an empty non-success response", async () => {
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test",
    maxRetries: 0,
    fetch: async () => new Response(null, { status: 502 }),
  });

  await assert.rejects(client.upi.getOrder("order-1"), error => {
    assert.ok(error instanceof PaySharpError);
    assert.equal(error.status, 502);
    assert.match(error.message, /HTTP 502/);
    return true;
  });
});

test("does not start a request when its signal is already aborted", async () => {
  let called = false;
  const reason = new Error("caller cancelled");
  const controller = new AbortController();
  controller.abort(reason);
  const client = new PaySharp({
    token: "token",
    baseUrl: "https://api.example.test",
    fetch: async () => {
      called = true;
      return success({});
    },
  });

  await assert.rejects(client.upi.getOrder("order-1", { signal: controller.signal }), reason);
  assert.equal(called, false);
});

test("validates retry and timeout configuration", async () => {
  assert.throws(
    () => new PaySharp({ token: "token", baseUrl: "https://api.example.test", maxRetries: 1.5 }),
    /non-negative integer/,
  );
  assert.throws(
    () => new PaySharp({ token: "token", baseUrl: "https://api.example.test", timeoutMs: 0 }),
    /positive number/,
  );

  const client = new PaySharp({ token: "token", baseUrl: "https://api.example.test", fetch: async () => success({}) });
  await assert.rejects(client.upi.getOrder("order-1", { timeoutMs: -1 }), /positive number/);
});
