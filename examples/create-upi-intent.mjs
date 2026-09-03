import { PaySharp } from "paysharp-node";

const token = process.env.PAYSHARP_TOKEN;
const baseUrl = process.env.PAYSHARP_BASE_URL;

if (!token || !baseUrl) {
  throw new Error("Set PAYSHARP_TOKEN and PAYSHARP_BASE_URL before running this example");
}

const client = new PaySharp({ token, baseUrl });
const orderId = `SDK-${Date.now()}`;

const order = await client.upi.createIntent({
  orderId,
  amount: 1,
  customerId: "SDK-EXAMPLE",
  customerName: "SDK Customer",
  customerMobileNo: "9111100000",
  customerEmail: "",
  remarks: orderId,
});

console.log({
  orderId: order.orderId,
  paysharpReferenceNo: order.paysharpReferenceNo,
  intentUrl: order.intentUrl,
});
