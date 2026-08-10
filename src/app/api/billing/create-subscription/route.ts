import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin-auth";
import { getPlanConfig, PlanType } from "@/lib/billing/plans";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/billing/razorpay";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization token" } },
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
      const rateLimitCheck = await checkRateLimit(`billing_${userId}`, RATE_LIMIT_CONFIG.billing);
      if (!rateLimitCheck.allowed) {
        return rateLimitedResponse(rateLimitCheck.retryAfter, "Billing request limit exceeded. Please wait a moment.");
      }
    } catch {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired user session" } },
        { status: 401 }
      );
    }

    // 2. Parse and validate requested plan
    const body = await req.json();
    const targetPlanId = (body.plan || "").toUpperCase() as PlanType;
    const planConfig = getPlanConfig(targetPlanId);

    if (planConfig.id === "FREE") {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Cannot create paid subscription for FREE plan" } },
        { status: 400 }
      );
    }

    // 3. Check Razorpay Configuration
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RAZORPAY_NOT_CONFIGURED",
            message: "Razorpay credentials are missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local to enable payments.",
            details: {
              plan: planConfig.id,
              amount: planConfig.price,
              currency: "INR",
            },
          },
        },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient()!;

    // 4. Create Order / Subscription via Razorpay SDK
    // Create an order in INR (amount in paise = price * 100)
    const options = {
      amount: planConfig.price * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${userId.substring(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        plan: planConfig.id,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      data: {
        keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan: planConfig.id,
        planName: planConfig.name,
      },
    });

  } catch (error: any) {
    console.error("Error creating subscription/order:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to initialize payment" } },
      { status: 500 }
    );
  }
}
