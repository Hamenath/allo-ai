import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Create a singleton initialization pattern to avoid repeated initialization during development
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || "dummy-project-id",
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "dummy-client-email@dummy.iam.gserviceaccount.com",
        // Replace escaped newlines if passed directly in env variable
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") || "-----BEGIN PRIVATE KEY-----\ndummy\n-----END PRIVATE KEY-----\n",
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const adminDb = getApps().length ? getFirestore() : null;
const adminAuth = getApps().length ? getAuth() : null;

export { adminDb, adminAuth };
