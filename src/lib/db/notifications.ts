import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

export type NotificationType = 
  | "welcome"
  | "ai_complete"
  | "usage_warning"
  | "usage_limit"
  | "payment_success"
  | "payment_failed"
  | "subscription_updated"
  | "subscription_cancelled"
  | "system";

export interface NotificationItem {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt?: any;
  metadata?: Record<string, any>;
}

/**
 * Create an in-app notification for a user
 */
export async function createNotification(data: Omit<NotificationItem, "id" | "read" | "createdAt">): Promise<string | null> {
  if (!db || !data.userId) return null;
  try {
    const colRef = collection(db, "notifications");
    const docRef = await addDoc(colRef, {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
}

/**
 * Create an in-app notification with idempotency protection
 */
export async function createNotificationIdempotent(
  userId: string,
  idempotencyKey: string,
  data: Omit<NotificationItem, "id" | "userId" | "read" | "createdAt">
): Promise<boolean> {
  if (!db || !userId || !idempotencyKey) return false;
  try {
    const keyRef = doc(db, "processedNotifications", idempotencyKey);
    const keySnap = await getDoc(keyRef);

    if (keySnap.exists()) {
      return false; // Already processed
    }

    await createNotification({ userId, ...data });

    await setDoc(keyRef, {
      userId,
      key: idempotencyKey,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.error("Error in createNotificationIdempotent:", err);
    return false;
  }
}

/**
 * Get recent notifications for a user
 */
export async function getNotifications(userId: string, maxResults = 30): Promise<NotificationItem[]> {
  if (!db || !userId) return [];
  try {
    const colRef = collection(db, "notifications");
    const q = query(
      colRef, 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc"), 
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  if (!db || !userId) return 0;
  try {
    const colRef = collection(db, "notifications");
    const q = query(
      colRef, 
      where("userId", "==", userId), 
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.error("Error fetching unread count:", err);
    return 0;
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!db || !notificationId) return;
  try {
    const ref = doc(db, "notifications", notificationId);
    await updateDoc(ref, { read: true });
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  if (!db || !userId) return;
  try {
    const colRef = collection(db, "notifications");
    const q = query(colRef, where("userId", "==", userId), where("read", "==", false));
    const snap = await getDocs(q);

    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
      batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Error marking all notifications read:", err);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  if (!db || !notificationId) return;
  try {
    const ref = doc(db, "notifications", notificationId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
}
