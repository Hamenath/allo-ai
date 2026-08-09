import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp, limit, startAfter, QueryConstraint } from "firebase/firestore";
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
  updatedAt?: any;
  isFavorite: boolean;
}

export async function saveAIGeneration(data: Omit<AIGeneration, "id" | "createdAt" | "updatedAt" | "isFavorite">) {
  if (!db) return null;
  const colRef = collection(db, "aiGenerations");
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isFavorite: false,
  });
  return docRef.id;
}

export async function updateGeneration(docId: string, data: Partial<AIGeneration>) {
  if (!db) return;
  const docRef = doc(db, "aiGenerations", docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getAIGenerations(
  userId: string,
  options?: {
    category?: string;
    isFavorite?: boolean;
    toolId?: string;
    limitCount?: number;
    lastDoc?: any;
  }
) {
  if (!db) return { docs: [], lastDoc: null };
  
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId)
  ];
  
  if (options?.category && options.category !== "ALL") {
    constraints.push(where("category", "==", options.category));
  }
  
  if (options?.isFavorite !== undefined) {
    constraints.push(where("isFavorite", "==", options.isFavorite));
  }

  if (options?.toolId) {
    constraints.push(where("toolId", "==", options.toolId));
  }
  
  constraints.push(orderBy("createdAt", "desc"));
  
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  
  if (options?.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const q = query(collection(db, "aiGenerations"), ...constraints);
  const snapshot = await getDocs(q);
  
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIGeneration[];
  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  
  return { docs, lastDoc: lastVisible };
}

export async function toggleFavorite(docId: string, currentStatus: boolean) {
  if (!db) return;
  const docRef = doc(db, "aiGenerations", docId);
  await updateDoc(docRef, {
    isFavorite: !currentStatus,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGeneration(docId: string) {
  if (!db) return;
  const docRef = doc(db, "aiGenerations", docId);
  await deleteDoc(docRef);
}
