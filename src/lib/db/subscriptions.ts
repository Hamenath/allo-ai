import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { PlanType } from "../billing/plans";

export type SubscriptionStatus = "active" | "pending" | "past_due" | "cancelled" | "expired" | "failed";

export interface SubscriptionRecord {
  id?: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  provider: "RAZORPAY";
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  providerOrderId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface PaymentHistoryRecord {
  id?: string;
  userId: string;
  plan: PlanType;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  provider: "RAZORPAY";
  paymentId: string;
  subscriptionId?: string;
  orderId?: string;
  createdAt?: any;
}

/**
 * Fetch active subscription info for a user
 */
export async function getSubscription(userId: string): Promise<SubscriptionRecord | null> {
  if (!db || !userId) return null;
  try {
    const subRef = doc(db, "subscriptions", userId);
    const subSnap = await getDoc(subRef);
    if (subSnap.exists()) {
      return { id: subSnap.id, ...subSnap.data() } as SubscriptionRecord;
    }
  } catch (err) {
    console.error("Error fetching subscription:", err);
  }
  return null;
}

/**
 * Server-side trusted update of user plan and subscription state
 */
export async function activateUserSubscription(
  userId: string,
  details: {
    plan: PlanType;
    status: SubscriptionStatus;
    providerSubscriptionId?: string;
    providerOrderId?: string;
    providerCustomerId?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  }
): Promise<void> {
  if (!db || !userId) return;

  const userRef = doc(db, "users", userId);
  const subRef = doc(db, "subscriptions", userId);

  // 1. Update trusted user document
  await setDoc(
    userRef,
    {
      plan: details.plan,
      subscriptionStatus: details.status,
      subscriptionId: details.providerSubscriptionId || details.providerOrderId || null,
      currentPeriodStart: details.currentPeriodStart || null,
      currentPeriodEnd: details.currentPeriodEnd || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // 2. Update subscription record
  await setDoc(
    subRef,
    {
      userId,
      plan: details.plan,
      status: details.status,
      provider: "RAZORPAY",
      providerCustomerId: details.providerCustomerId || null,
      providerSubscriptionId: details.providerSubscriptionId || null,
      providerOrderId: details.providerOrderId || null,
      currentPeriodStart: details.currentPeriodStart || null,
      currentPeriodEnd: details.currentPeriodEnd || null,
      cancelAtPeriodEnd: details.cancelAtPeriodEnd || false,
      updatedAt: serverTimestamp(),
      ...(await getDoc(subRef)).exists() ? {} : { createdAt: serverTimestamp() },
    },
    { merge: true }
  );
}

/**
 * Save payment history log
 */
export async function savePaymentHistoryRecord(data: Omit<PaymentHistoryRecord, "id" | "createdAt">): Promise<void> {
  if (!db) return;
  try {
    const colRef = collection(db, "paymentHistory");
    await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error saving payment history:", err);
  }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId: string): Promise<PaymentHistoryRecord[]> {
  if (!db || !userId) return [];
  try {
    const colRef = collection(db, "paymentHistory");
    const q = query(colRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as PaymentHistoryRecord));
  } catch (err) {
    console.error("Error fetching payment history:", err);
    return [];
  }
}

/**
 * Check if a webhook event ID has already been processed (Idempotency)
 */
export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  if (!db || !eventId) return false;
  try {
    const ref = doc(db, "processedWebhooks", eventId);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    console.error("Error checking webhook idempotency:", err);
    return false;
  }
}

/**
 * Mark a webhook event ID as processed
 */
export async function markWebhookProcessed(eventId: string, eventType: string): Promise<void> {
  if (!db || !eventId) return;
  try {
    const ref = doc(db, "processedWebhooks", eventId);
    await setDoc(ref, {
      eventId,
      eventType,
      processedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error marking webhook processed:", err);
  }
}
