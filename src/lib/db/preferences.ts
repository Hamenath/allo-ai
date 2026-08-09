import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  billingNotifications: boolean;
  usageNotifications: boolean;
  productNotifications: boolean;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: true,
  inAppNotifications: true,
  billingNotifications: true,
  usageNotifications: true,
  productNotifications: false,
};

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  if (!db || !userId) return DEFAULT_PREFERENCES;
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.notificationPreferences) {
        return { ...DEFAULT_PREFERENCES, ...data.notificationPreferences };
      }
    }
  } catch (err) {
    console.error("Error fetching notification preferences:", err);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<NotificationPreferences>
): Promise<void> {
  if (!db || !userId) return;
  try {
    const userRef = doc(db, "users", userId);
    const existing = await getNotificationPreferences(userId);
    const updated = { ...existing, ...prefs };

    await setDoc(
      userRef,
      {
        notificationPreferences: updated,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Error updating notification preferences:", err);
  }
}
