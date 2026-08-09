import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AIGeneration {
  id?: string;
  userId: string;
  toolId: string;
  category: string;
  title: string;
  input: any;
  output: any;
  createdAt: any;
  isFavorite: boolean;
}

export async function saveAIGeneration(data: Omit<AIGeneration, "id" | "createdAt" | "isFavorite">) {
  if (!db) return null;
  const colRef = collection(db, "aiGenerations");
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    isFavorite: false,
  });
  return docRef.id;
}

export async function getAIGenerations(userId: string) {
  if (!db) return [];
  const q = query(
    collection(db, "aiGenerations"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIGeneration[];
}

export async function toggleFavorite(docId: string, currentStatus: boolean) {
  if (!db) return;
  const docRef = doc(db, "aiGenerations", docId);
  await updateDoc(docRef, {
    isFavorite: !currentStatus
  });
}

export async function deleteGeneration(docId: string) {
  if (!db) return;
  const docRef = doc(db, "aiGenerations", docId);
  await deleteDoc(docRef);
}
