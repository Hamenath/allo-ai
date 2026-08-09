import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase();
    const plan = searchParams.get("plan");

    if (!adminDb) {
      return NextResponse.json({ success: true, data: { users: [] } });
    }

    let query: any = adminDb.collection("users");
    if (plan && plan !== "ALL") {
      query = query.where("plan", "==", plan.toUpperCase());
    }

    const snap = await query.limit(100).get();
    const usersList: any[] = [];

    snap.forEach((docSnap: any) => {
      const d = docSnap.data();
      const name = d.displayName || d.name || "Unnamed";
      const email = d.email || "";

      if (
        !search ||
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search)
      ) {
        usersList.push({
          id: docSnap.id,
          name,
          email,
          plan: d.plan || "FREE",
          role: d.role || "user",
          disabled: Boolean(d.disabled),
          subscriptionStatus: d.subscriptionStatus || "active",
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || null,
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        users: usersList,
        total: usersList.length,
      },
    });
  } catch (error: any) {
    console.error("Admin list users error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch users" } },
      { status: 500 }
    );
  }
}
