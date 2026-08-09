import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { getPlanConfig, PlanType } from "../billing/plans";

export interface UsageInfo {
  plan: PlanType;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetAt: string;
}

export function getCurrentPeriodId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}_${month}`;
}

export function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

/**
 * Fetch the user's assigned plan from `users/{userId}` or default to FREE
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  if (!db || !userId) return "FREE";
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.plan) {
        return data.plan.toUpperCase() as PlanType;
      }
    }
  } catch (err) {
    console.error("Error fetching user plan:", err);
  }
  return "FREE";
}

/**
 * Get current monthly usage for a user
 */
export async function getUsage(userId: string): Promise<UsageInfo> {
  const plan = await getUserPlan(userId);
  const planConfig = getPlanConfig(plan);
  const period = getCurrentPeriodId();
  const resetAt = getNextResetDate();

  let used = 0;

  if (db && userId) {
    try {
      const usageDocId = `${userId}_${period}`;
      const usageRef = doc(db, "usage", usageDocId);
      const usageSnap = await getDoc(usageRef);

      if (usageSnap.exists()) {
        used = usageSnap.data().generationCount || 0;
      }
    } catch (err) {
      console.error("Error reading usage doc:", err);
    }
  }

  const limit = planConfig.monthlyGenerations;
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return {
    plan,
    used,
    limit,
    remaining,
    percentage,
    resetAt,
  };
}

/**
 * Check if user is allowed to perform an AI generation
 */
export async function checkUsage(userId: string): Promise<{ allowed: boolean; usageInfo: UsageInfo }> {
  const usageInfo = await getUsage(userId);
  const allowed = usageInfo.remaining > 0;
  return { allowed, usageInfo };
}

/**
 * Atomically increment usage after a successful generation
 */
export async function incrementUsage(userId: string): Promise<void> {
  if (!db || !userId) return;
  const period = getCurrentPeriodId();
  const usageDocId = `${userId}_${period}`;
  const usageRef = doc(db, "usage", usageDocId);

  try {
    const usageSnap = await getDoc(usageRef);
    if (usageSnap.exists()) {
      await updateDoc(usageRef, {
        generationCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(usageRef, {
        userId,
        period,
        generationCount: 1,
        updatedAt: serverTimestamp(),
      });
    }

    // Trigger threshold alerts asynchronously without blocking execution
    setTimeout(async () => {
      try {
        const info = await getUsage(userId);
        const { createNotificationIdempotent } = await import("./notifications");
        const { sendTransactionalEmail } = await import("../email/provider");
        const { getUsageWarningEmailTemplate, getUsageLimitEmailTemplate } = await import("../email/templates");

        if (info.remaining <= 0) {
          const key = `${userId}_usage_100_${period}`;
          await createNotificationIdempotent(userId, key, {
            type: "usage_limit",
            title: "AI Generation Quota Reached",
            message: `You've used all ${info.limit} AI generations for this month. Upgrade to continue creating.`,
            link: "/billing",
          });
          const userDoc = await getDoc(doc(db, "users", userId));
          const userEmail = userDoc.data()?.email;
          if (userEmail) {
            const template = getUsageLimitEmailTemplate(info.used, info.limit);
            await sendTransactionalEmail({
              to: userEmail,
              ...template,
              idempotencyKey: key,
            });
          }
        } else if (info.percentage >= 80) {
          const key = `${userId}_usage_80_${period}`;
          await createNotificationIdempotent(userId, key, {
            type: "usage_warning",
            title: "Approaching Monthly AI Quota",
            message: `You've used ${info.used} of ${info.limit} AI generations (${info.percentage}%).`,
            link: "/usage",
          });
          const userDoc = await getDoc(doc(db, "users", userId));
          const userEmail = userDoc.data()?.email;
          if (userEmail) {
            const template = getUsageWarningEmailTemplate(info.used, info.limit);
            await sendTransactionalEmail({
              to: userEmail,
              ...template,
              idempotencyKey: key,
            });
          }
        }
      } catch (err) {
        console.error("Error triggering usage threshold alert:", err);
      }
    }, 100);
  } catch (err) {
    console.error("Error incrementing usage:", err);
  }
}

/**
 * Save AI Generation record on server
 */
export async function saveServerGeneration(data: {
  userId: string;
  toolId: string;
  category: string;
  title: string;
  input: any;
  output: any;
}): Promise<string | null> {
  if (!db) return null;
  try {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const colRef = collection(db, "aiGenerations");
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isFavorite: false,
    });
    return docRef.id;
  } catch (err) {
    console.error("Error saving generation record:", err);
    return null;
  }
}

