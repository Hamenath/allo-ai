import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAdminApp } from "./firebase-admin-app";

const app = getAdminApp();
export const adminDb: Firestore | null = app ? getFirestore(app) : null;
