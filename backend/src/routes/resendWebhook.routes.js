// backend/src/routes/resendWebhook.routes.js
import express from "express";
import crypto from "crypto";

const router = express.Router();

// replace with your Resend webhook secret
const RESEND_SECRET = process.env.RESEND_WEBHOOK_SECRET;

router.post("/resend", express.raw({ type: "*/*" }), (req, res) => {
  const signature = req.headers["resend-signature"];
  const payload = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", RESEND_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.log("❌ Invalid webhook signature!");
    return res.status(401).send("Unauthorized");
  }

  const event = JSON.parse(payload.toString());

  console.log("📬 Resend Webhook Event:", event);

  // Example: handle events
  switch (event.type) {
    case "delivered":
      console.log(`✅ Email delivered to ${event.data.to}`);
      break;
    case "failed":
      console.log(`❌ Email failed to ${event.data.to}: ${event.data.error}`);
      break;
    case "opened":
      console.log(`👀 Email opened by ${event.data.to}`);
      break;
    case "clicked":
      console.log(`🖱 Email clicked by ${event.data.to}`);
      break;
    default:
      console.log("⚠️ Unknown event type:", event.type);
  }

  res.status(200).send("OK");
});

export default router;