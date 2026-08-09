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

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
}

export interface Invoice {
  id?: string;
  userId: string;
  
  // Business
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessGstin?: string;
  
  // Client
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  
  items: InvoiceItem[];
  
  // Calculations
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  total: number;
  
  createdAt?: any;
  updatedAt?: any;
}

const INVOICES_COLLECTION = "invoices";

export async function saveInvoice(userId: string, invoice: Omit<Invoice, "userId" | "createdAt" | "updatedAt"> & { id?: string }): Promise<string> {
  const invoiceId = invoice.id || doc(collection(db, INVOICES_COLLECTION)).id;
  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
  
  await setDoc(invoiceRef, {
    ...invoice,
    userId,
    createdAt: invoice.id ? undefined : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  
  return invoiceId;
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const invoices: Invoice[] = [];
  
  querySnapshot.forEach((doc) => {
    invoices.push({ id: doc.id, ...doc.data() } as Invoice);
  });
  
  return invoices;
}

export async function getInvoice(userId: string, invoiceId: string): Promise<Invoice | null> {
  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);
  
  if (invoiceSnap.exists() && invoiceSnap.data().userId === userId) {
    return { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
  }
  
  return null;
}

export async function deleteInvoice(userId: string, invoiceId: string): Promise<boolean> {
  // First verify ownership
  const invoiceRef = doc(db, INVOICES_COLLECTION, invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);
  
  if (invoiceSnap.exists() && invoiceSnap.data().userId === userId) {
    await deleteDoc(invoiceRef);
    return true;
  }
  return false;
}
