import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin-firestore";

export interface AdminAuthResult {
  isAuthorized: boolean;
  userId?: string;
  email?: string;
  errorResponse?: NextResponse;
}

/**
 * Server-side trusted verification of Admin access.
 * Checks Firebase Token + Firestore user role ("admin") or ADMIN_EMAIL fallback.
 */
export async function verifyAdminUser(req: Request): Promise<AdminAuthResult> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Missing or malformed Authorization header" } },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split("Bearer ")[1];
    const { adminAuth } = await import("@/lib/firebase-admin-auth");

    if (!adminAuth) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: { code: "SERVER_ERROR", message: "Firebase Admin Auth not initialized" } },
          { status: 500 }
        ),
      };
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const userId = decoded.uid;
    const email = decoded.email || "";

    // 1. Check custom claim if present
    if (decoded.role === "admin" || decoded.admin === true) {
      return { isAuthorized: true, userId, email };
    }

    // 2. Check environment override
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
      return { isAuthorized: true, userId, email };
    }

    // 3. Check Firestore `users/{userId}` role
    if (adminDb) {
      const userSnap = await adminDb.collection("users").doc(userId).get();
      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData?.role === "admin") {
          return { isAuthorized: true, userId, email };
        }
      }
    }

    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      ),
    };
  } catch (error: any) {
    console.error("Admin verification error:", error);
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } },
        { status: 401 }
      ),
    };
  }
}

/**
 * Log administrative action to `auditLogs` collection in Firestore
 */
export async function logAdminAction(data: {
  adminUserId: string;
  adminEmail?: string;
  action: string;
  target?: string;
  details?: any;
}): Promise<void> {
  if (!adminDb) return;
  try {
    const { FieldValue } = await import("firebase-admin/firestore");
    await adminDb.collection("auditLogs").add({
      ...data,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}
