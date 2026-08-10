import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin-firestore";
import { adminAuth } from "@/lib/firebase-admin-auth";
import { isRazorpayConfigured } from "@/lib/billing/razorpay";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);
    const isRazorpayReady = isRazorpayConfigured();
    const isEmailReady = Boolean(process.env.RESEND_API_KEY);
    const isFirebaseAdminReady = Boolean(adminDb && adminAuth);
    const nodeEnv = process.env.NODE_ENV || "development";

    const { isDistributedStoreConfigured } = await import("@/lib/security/rate-limit");
    const isRedisReady = isDistributedStoreConfigured();

    return NextResponse.json({
      success: true,
      data: {
        applicationStatus: "OPERATIONAL",
        nodeEnv,
        firebaseAdmin: isFirebaseAdminReady ? "Configured ✓" : "Not Configured ✗",
        firestore: adminDb ? "Connected ✓" : "Disconnected ✗",
        geminiAi: isGeminiConfigured ? "Configured ✓" : "Missing API Key ✗",
        razorpayBilling: isRazorpayReady ? "Configured ✓" : "Missing Keys ✗",
        emailProvider: isEmailReady ? "Configured ✓ (Resend)" : "Development Logging ✗",
        rateLimiting: "Configured ✓",
        distributedStore: isRedisReady ? "Configured ✓ (Upstash Redis)" : "Development Fallback ✗ (Redis required for multi-instance)",
        aiProtection: "Active ✓ (10 req/min, 2 concurrent lock)",
      },
    });
  } catch (error: any) {
    console.error("Admin system health error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch system status" } },
      { status: 500 }
    );
  }
}
