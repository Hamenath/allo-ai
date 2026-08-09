import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export type CRMClientStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

export interface CRMClient {
  id?: string;
  userId: string;
  
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
  status: CRMClientStatus;
  source: string;
  dealValue: number;
  followUpDate: string; // ISO format date string
  
  createdAt?: any;
  updatedAt?: any;
}

const CRM_COLLECTION = "crm_clients";

export async function saveClient(userId: string, client: Omit<CRMClient, "userId" | "createdAt" | "updatedAt"> & { id?: string }): Promise<string> {
  const clientId = client.id || doc(collection(db, CRM_COLLECTION)).id;
  const clientRef = doc(db, CRM_COLLECTION, clientId);
  
  await setDoc(clientRef, {
    ...client,
    userId,
    createdAt: client.id ? undefined : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  return clientId;
}

export async function getClients(userId: string): Promise<CRMClient[]> {
  const q = query(
    collection(db, CRM_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const clients: CRMClient[] = [];
  
  querySnapshot.forEach((doc) => {
    clients.push({ id: doc.id, ...doc.data() } as CRMClient);
  });
  
  return clients;
}

export async function deleteClient(userId: string, clientId: string): Promise<boolean> {
  const clientRef = doc(db, CRM_COLLECTION, clientId);
  const clientSnap = await getDoc(clientRef);
  
  if (clientSnap.exists() && clientSnap.data().userId === userId) {
    await deleteDoc(clientRef);
    return true;
  }
  return false;
}
