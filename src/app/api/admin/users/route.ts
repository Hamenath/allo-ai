import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/admin/auth";
import { adminDb } from "@/lib/firebase-admin-firestore";

export async function GET(req: Request) {
  const auth = await verifyAdminUser(req);
  if (!auth.isAuthorized) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").toLowerCase();
    const plan = searchParams.get("plan");

    const userMap = new Map<string, any>();

    // 1. Fetch from Firestore users collection
    if (adminDb) {
      try {
        let query: any = adminDb.collection("users");
        if (plan && plan !== "ALL") {
          query = query.where("plan", "==", plan.toUpperCase());
        }

        const snap = await query.limit(100).get();
        snap.forEach((docSnap: any) => {
          const d = docSnap.data();
          userMap.set(docSnap.id, {
            id: docSnap.id,
            name: d.displayName || d.name || "Unnamed User",
            email: d.email || "",
            plan: d.plan || "FREE",
            role: d.role || "user",
            disabled: Boolean(d.disabled),
            subscriptionStatus: d.subscriptionStatus || "active",
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || null,
          });
        });
      } catch (dbErr) {
        console.error("Firestore user list error:", dbErr);
      }
    }

    // 2. Fetch from Firebase Auth users list as a fallback / complement
    try {
      const { adminAuth } = await import("@/lib/firebase-admin-auth");
      if (adminAuth) {
        const authList = await adminAuth.listUsers(100);
        authList.users.forEach((userRec) => {
          const existing = userMap.get(userRec.uid);
          if (!existing) {
            userMap.set(userRec.uid, {
              id: userRec.uid,
              name: userRec.displayName || userRec.email?.split("@")[0] || "Unnamed User",
              email: userRec.email || "",
              plan: "FREE",
              role: "user",
              disabled: userRec.disabled,
              subscriptionStatus: "active",
              createdAt: userRec.metadata.creationTime || null,
            });
          } else {
            // Fill in email or name if missing in Firestore doc
            if (!existing.email && userRec.email) existing.email = userRec.email;
            if (existing.name === "Unnamed User" && userRec.displayName) existing.name = userRec.displayName;
          }
        });
      }
    } catch (authErr) {
      console.error("Firebase Auth listUsers error:", authErr);
    }

    // 3. Filter by search & plan
    let usersList = Array.from(userMap.values());

    if (search) {
      usersList = usersList.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (plan && plan !== "ALL") {
      usersList = usersList.filter((u) => u.plan.toUpperCase() === plan.toUpperCase());
    }

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
