import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  updatedAt: any;
  plan: "FREE" | "PRO" | "BUSINESS";
  usage: {
    generations: number;
    lastGeneration: any | null;
  };
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

export async function syncUserProfile(user: any) {
  if (!db) return null;
  
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new profile
    const newProfile = {
      uid: user.uid,
      name: user.displayName || null,
      email: user.email || null,
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      plan: "FREE",
      usage: {
        generations: 0,
        lastGeneration: null,
      },
      preferences: {
        theme: "system",
        notifications: true,
      },
    };
    
    await setDoc(userRef, newProfile);
    return newProfile;
  }
  
  return userSnap.data() as UserProfile;
}


// Only these fields may be updated by client-side operations via this helper.
// Plan, role, subscriptionStatus, and other trusted fields are EXCLUDED — they are
// written exclusively by the Admin SDK on the server.
export interface SafeUserProfileUpdate {
  name?: string | null;
  photoURL?: string | null;
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

export async function updateUserProfile(uid: string, data: SafeUserProfileUpdate) {
  if (!db) return;
  // Build update with only safe fields — never spread unknown data
  const safeUpdate: Record<string, any> = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) safeUpdate.name = data.name;
  if (data.photoURL !== undefined) safeUpdate.photoURL = data.photoURL;
  if (data.preferences !== undefined) safeUpdate.preferences = data.preferences;

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, safeUpdate);
}

