import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin-firestore";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const { userId } = await params;
    if (!adminDb || !userId) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User document not found" } },
        { status: 404 }
      );
    }

    const userData = userDoc.data()!;
    const subDoc = await adminDb.collection("subscriptions").doc(userId).get();
    const subData = subDoc.exists ? subDoc.data() : null;

    // Fetch user generation count
    const genSnap = await adminDb.collection("aiGenerations").where("userId", "==", userId).get();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          name: userData.displayName || userData.name || "Unnamed",
          email: userData.email || "",
          plan: userData.plan || "FREE",
          role: userData.role || "user",
          disabled: Boolean(userData.disabled),
          subscriptionStatus: userData.subscriptionStatus || "active",
          createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : userData.createdAt || null,
        },
        subscription: subData,
        generationCount: genSnap.size,
      },
    });
  } catch (error: any) {
    console.error("Admin get user error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch user" } },
      { status: 500 }
    );
  }
}
