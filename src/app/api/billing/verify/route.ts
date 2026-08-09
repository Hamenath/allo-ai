import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getPlanConfig, PlanType } from "@/lib/billing/plans";
import { verifyPaymentSignature } from "@/lib/billing/razorpay";
import { activateUserSubscription, savePaymentHistoryRecord } from "@/lib/db/subscriptions";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
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
      const rateLimitCheck = await checkRateLimit(`billing_verify_${userId}`, RATE_LIMIT_CONFIG.billing);
      if (!rateLimitCheck.allowed) {
        return rateLimitedResponse(rateLimitCheck.retryAfter, "Verification rate limit exceeded. Please wait a moment.");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid authorization token" } },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan,
    } = body;

    if (!razorpay_payment_id || !razorpay_signature || !plan) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Missing required payment verification parameters" } },
        { status: 400 }
      );
    }

    // 3. Verify HMAC signature server-side
    const isValid = verifyPaymentSignature({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      subscriptionId: razorpay_subscription_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: "VERIFICATION_FAILED", message: "Invalid payment signature" } },
        { status: 400 }
      );
    }

    // 4. Determine trusted plan specs
    const targetPlan = (plan || "PRO").toUpperCase() as PlanType;
    const planConfig = getPlanConfig(targetPlan);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 5. Activate plan in Firestore
    await activateUserSubscription(userId, {
      plan: planConfig.id,
      status: "active",
      providerOrderId: razorpay_order_id,
      providerSubscriptionId: razorpay_subscription_id,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd,
    });

    // 6. Record Payment History
    await savePaymentHistoryRecord({
      userId,
      plan: planConfig.id,
      amount: planConfig.price,
      currency: "INR",
      status: "SUCCESS",
      provider: "RAZORPAY",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      subscriptionId: razorpay_subscription_id,
    });

    return NextResponse.json({
      success: true,
      data: {
        plan: planConfig.id,
        status: "active",
        currentPeriodEnd: periodEnd,
      },
    });

  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Verification failed" } },
      { status: 500 }
    );
  }
}
