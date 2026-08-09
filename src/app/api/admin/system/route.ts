import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { isRazorpayConfigured } from "@/lib/billing/razorpay";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);
    const isRazorpayReady = isRazorpayConfigured();
    const isFirebaseAdminReady = Boolean(adminDb && adminAuth);
    const nodeEnv = process.env.NODE_ENV || "development";

    return NextResponse.json({
      success: true,
      data: {
        applicationStatus: "OPERATIONAL",
        nodeEnv,
        firebaseAdmin: isFirebaseAdminReady ? "Configured ✓" : "Not Configured ✗",
        firestore: adminDb ? "Connected ✓" : "Disconnected ✗",
        geminiAi: isGeminiConfigured ? "Configured ✓" : "Missing API Key ✗",
        razorpayBilling: isRazorpayReady ? "Configured ✓" : "Missing Keys ✗",
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
