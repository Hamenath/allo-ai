import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin-firestore";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    if (!adminDb) {
      return NextResponse.json({ success: true, data: { logs: [] } });
    }

    const snap = await adminDb
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const logs = snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        adminUserId: d.adminUserId,
        adminEmail: d.adminEmail || "Admin",
        action: d.action,
        target: d.target || "N/A",
        details: d.details || null,
        timestamp: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: { logs },
    });
  } catch (error: any) {
    console.error("Admin audit log error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch audit log" } },
      { status: 500 }
    );
  }
}
