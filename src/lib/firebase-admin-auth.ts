import { getAuth, type Auth } from "firebase-admin/auth";
import { getAdminApp } from "./firebase-admin-app";

const app = getAdminApp();
export const adminAuth: Auth | null = app ? getAuth(app) : null;
