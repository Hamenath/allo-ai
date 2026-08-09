import { adminDb } from "@/lib/firebase-admin";

const PLAN_LIMITS = {
  FREE: 5,
  PRO: 100,
  BUSINESS: 500,
};

export async function checkUsage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  if (!adminDb) {
    console.warn("adminDb not initialized, bypassing usage check");
    return { allowed: true, remaining: 999 };
  }

  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return { allowed: false, remaining: 0 };
  }

  const userData = userSnap.data();
  const plan = userData?.plan || "FREE";
  
  // Here we would ideally check if the month has reset, but for MVP we just use the raw count
  const generations = userData?.usage?.generations || 0;
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.FREE;

  const remaining = Math.max(0, limit - generations);
  return {
    allowed: generations < limit,
    remaining,
  };
}

export async function incrementUsage(userId: string) {
  if (!adminDb) return;
  const userRef = adminDb.collection("users").doc(userId);
  
  // In a real app we'd use Firestore transactions/FieldValue.increment,
  // but let's keep it simple or use adminDb.FieldValue.increment
  
  try {
    const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
    await userRef.update({
      "usage.generations": FieldValue.increment(1),
      "usage.lastGeneration": FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to increment usage", error);
  }
}

export async function saveServerGeneration(data: any) {
  if (!adminDb) return null;
  
  try {
    const FieldValue = (await import("firebase-admin/firestore")).FieldValue;
    const colRef = adminDb.collection("aiGenerations");
    const docRef = await colRef.add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      isFavorite: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to save generation", error);
    return null;
  }
}
