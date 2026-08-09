import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/billing/razorpay";
import { 
  activateUserSubscription, 
  isWebhookProcessed, 
  markWebhookProcessed, 
  savePaymentHistoryRecord 
} from "@/lib/db/subscriptions";
import { PlanType } from "@/lib/billing/plans";
import { checkRateLimit, rateLimitedResponse } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    // 0. Rate limit webhook endpoint: 60 requests/min (generous for Razorpay retries)
    const forwardedFor = req.headers.get("x-forwarded-for") || "unknown";
    const ipKey = `webhook_rp_${forwardedFor.split(",")[0].trim()}`;
    const rlCheck = await checkRateLimit(ipKey, { limit: 60, windowMs: 60 * 1000 });
    if (!rlCheck.allowed) {
      return rateLimitedResponse(rlCheck.retryAfter, "Webhook rate limit exceeded.");
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");


    if (!signature) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Missing x-razorpay-signature header" } },
        { status: 400 }
      );
    }

    // 1. Verify Webhook Signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid webhook signature" } },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || payload.id;
    const eventType = payload.event;

    // 2. Webhook Idempotency Check
    if (eventId) {
      const alreadyProcessed = await isWebhookProcessed(eventId);
      if (alreadyProcessed) {
        return NextResponse.json({ success: true, duplicate: true, message: "Webhook already processed" });
      }
    }

    // 3. Process Event Lifecycle
    const payloadEntity = payload.payload?.payment?.entity || payload.payload?.subscription?.entity || {};
    const notes = payloadEntity.notes || {};
    const userId = notes.userId;
    const plan: PlanType = (notes.plan || "PRO").toUpperCase() as PlanType;

    if (userId) {
      if (eventType === "payment.captured" || eventType === "subscription.charged" || eventType === "order.paid") {
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await activateUserSubscription(userId, {
          plan,
          status: "active",
          providerSubscriptionId: payloadEntity.subscription_id || null,
          providerOrderId: payloadEntity.order_id || null,
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: periodEnd,
        });

        await savePaymentHistoryRecord({
          userId,
          plan,
          amount: (payloadEntity.amount || 0) / 100,
          currency: payloadEntity.currency || "INR",
          status: "SUCCESS",
          provider: "RAZORPAY",
          paymentId: payloadEntity.id || "webhook_event",
          orderId: payloadEntity.order_id,
          subscriptionId: payloadEntity.subscription_id,
        });
      } else if (eventType === "subscription.cancelled" || eventType === "subscription.halted") {
        await activateUserSubscription(userId, {
          plan: "FREE",
          status: "cancelled",
          cancelAtPeriodEnd: false,
        });
      }
    }

    // 4. Mark Webhook as Processed
    if (eventId) {
      await markWebhookProcessed(eventId, eventType || "unknown");
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Webhook handler failed" } },
      { status: 500 }
    );
  }
}
