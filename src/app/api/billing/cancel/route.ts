import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin-auth";
import { activateUserSubscription, getSubscription } from "@/lib/db/subscriptions";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing authorization token" } },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    let userId: string;

    try {
      if (!adminAuth) throw new Error("Firebase Admin not configured");
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;

      // 2. Billing Rate Limit Check (5 req/min)
      const { checkRateLimit, rateLimitedResponse, RATE_LIMIT_CONFIG } = await import("@/lib/security/rate-limit");
      const rateLimitCheck = await checkRateLimit(`billing_cancel_${userId}`, RATE_LIMIT_CONFIG.billing);
      if (!rateLimitCheck.allowed) {
        return rateLimitedResponse(rateLimitCheck.retryAfter, "Cancellation rate limit exceeded. Please wait a moment.");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid authorization token" } },
        { status: 401 }
      );
    }

    const existingSub = await getSubscription(userId);

    if (!existingSub || existingSub.plan === "FREE") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "No active paid subscription to cancel" } },
        { status: 400 }
      );
    }

    // Set cancelAtPeriodEnd to true without immediately revoking paid access
    await activateUserSubscription(userId, {
      plan: existingSub.plan,
      status: "cancelled",
      providerSubscriptionId: existingSub.providerSubscriptionId,
      providerOrderId: existingSub.providerOrderId,
      currentPeriodStart: existingSub.currentPeriodStart,
      currentPeriodEnd: existingSub.currentPeriodEnd,
      cancelAtPeriodEnd: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: `Your subscription will remain active until ${existingSub.currentPeriodEnd || 'the end of your current period'}.`,
        cancelAtPeriodEnd: true,
      },
    });

  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to cancel subscription" } },
      { status: 500 }
    );
  }
}
