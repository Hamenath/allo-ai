import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send transactional email with idempotency protection and provider fallback
 */
export async function sendTransactionalEmail(options: EmailOptions): Promise<{ success: boolean; delivered: boolean }> {
  try {
    if (!options.to) return { success: false, delivered: false };

    // 1. Idempotency Check
    if (options.idempotencyKey && db) {
      const emailRef = doc(db, "processedEmails", options.idempotencyKey);
      const emailSnap = await getDoc(emailRef);
      if (emailSnap.exists()) {
        return { success: true, delivered: false }; // Already sent
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || "ALLO AI <notifications@example.com>";

    let delivered = false;

    if (apiKey) {
      // Send via Resend REST API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (res.ok) {
        delivered = true;
      } else {
        const errorJson = await res.json().catch(() => ({}));
        console.error("Resend API error:", errorJson);
      }
    } else {
      // Safe development fallback: log email dispatch
      console.log(`[EMAIL DISPATCH] To: ${options.to} | Subject: ${options.subject}`);
      delivered = false; // Credentials not configured
    }

    // 2. Mark Idempotency Key as Processed
    if (options.idempotencyKey && db) {
      try {
        const emailRef = doc(db, "processedEmails", options.idempotencyKey);
        await setDoc(emailRef, {
          to: options.to,
          subject: options.subject,
          delivered,
          createdAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Error logging processed email idempotency:", e);
      }
    }

    return { success: true, delivered };

  } catch (error) {
    // Non-blocking error handling: Email failures must NEVER crash primary operations
    console.error("Failed to send transactional email:", error);
    return { success: false, delivered: false };
  }
}
