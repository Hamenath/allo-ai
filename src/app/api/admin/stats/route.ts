import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin-firestore";
import { toolsRegistry } from "@/lib/ai/registry";
import { isRazorpayConfigured } from "@/lib/billing/razorpay";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    let totalUsers = 0;
    let freeUsers = 0;
    let proUsers = 0;
    let businessUsers = 0;
    let totalGenerations = 0;
    let activeSubscriptions = 0;
    let totalRevenue = 0;

    if (adminDb) {
      // 1. User stats
      const usersSnap = await adminDb.collection("users").get();
      totalUsers = usersSnap.size;
      usersSnap.forEach((doc) => {
        const data = doc.data();
        const plan = (data.plan || "FREE").toUpperCase();
        if (plan === "PRO") proUsers++;
        else if (plan === "BUSINESS") businessUsers++;
        else freeUsers++;
      });

      // 2. AI Generations count
      const genSnap = await adminDb.collection("aiGenerations").get();
      totalGenerations = genSnap.size;

      // 3. Subscriptions
      const subSnap = await adminDb.collection("subscriptions").where("status", "==", "active").get();
      activeSubscriptions = subSnap.size;

      // 4. Revenue from payment history
      const paySnap = await adminDb.collection("paymentHistory").where("status", "==", "SUCCESS").get();
      paySnap.forEach((doc) => {
        totalRevenue += doc.data().amount || 0;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        freeUsers,
        proUsers,
        businessUsers,
        totalGenerations,
        activeSubscriptions,
        totalRevenue,
        totalTools: Object.keys(toolsRegistry).length,
        isRazorpayConfigured: isRazorpayConfigured(),
        isGeminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch stats" } },
      { status: 500 }
    );
  }
}
