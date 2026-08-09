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

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!db) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
