import { NextResponse } from "next/server";
import { verifyAdminUser, logAdminAction } from "@/lib/admin/auth";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const { userId } = await params;
    const body = await req.json();
    const { disabled, role } = body;

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: { code: "SERVER_ERROR", message: "Database not configured" } },
        { status: 500 }
      );
    }

    const updates: any = {};
    if (typeof disabled === "boolean") updates.disabled = disabled;
    if (role && (role === "user" || role === "admin")) updates.role = role;

    // 1. Update Firestore user document
    await adminDb.collection("users").doc(userId).set(updates, { merge: true });

    // 2. Update Firebase Auth user if disabled status changed
    if (adminAuth && typeof disabled === "boolean") {
      try {
        await adminAuth.updateUser(userId, { disabled });
      } catch (err) {
        console.error("Auth updateUser error:", err);
      }
    }

    // 3. Log Admin Action in audit log
    await logAdminAction({
      adminUserId: auth.userId!,
      adminEmail: auth.email,
      action: typeof disabled === "boolean" ? (disabled ? "DISABLE_USER" : "ENABLE_USER") : "UPDATE_ROLE",
      target: userId,
      details: updates,
    });

    return NextResponse.json({
      success: true,
      data: { userId, ...updates },
    });
  } catch (error: any) {
    console.error("Admin status update error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Update failed" } },
      { status: 500 }
    );
  }
}
