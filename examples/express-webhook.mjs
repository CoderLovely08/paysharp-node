import express from "express";
import { parseWebhook, webhookAcknowledgement } from "paysharp-node";

const app = express();
app.use(express.json({ limit: "100kb" }));

app.post("/webhooks/paysharp", async (request, response) => {
  const event = parseWebhook(request.body);

  // Store the event and process it idempotently before acknowledging it.
  console.log("PaySharp webhook received", {
    reference: event.paysharpReferenceNo,
    status: "status" in event ? event.status : undefined,
  });

  response.status(200).json(webhookAcknowledgement());
});

app.listen(3000, () => console.log("Listening on http://localhost:3000"));
