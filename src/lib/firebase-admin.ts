import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
  type Credential,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const PROJECT_ID =
  process.env.GCP_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "allo-ai-798fe";

function createAdminCredential(): Credential {
  // 1. Explicit Service Account Key (Legacy/Local dev fallback if key provided)
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return cert({
      projectId: PROJECT_ID,
      clientEmail:
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
        process.env.GCP_SERVICE_ACCOUNT_EMAIL ||
        "",
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  // 2. Application Default Credential (satisfies Firebase Admin & Firestore SDK checks)
  const cred = applicationDefault();

  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId =
    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER_ID ||
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  // On Vercel (or when WIF env vars exist), attach ExternalAccountClient to ApplicationDefaultCredential
  if (projectNumber && poolId && providerId && serviceAccountEmail) {
    const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: async () => {
          if (process.env.VERCEL_OIDC_TOKEN) {
            return process.env.VERCEL_OIDC_TOKEN;
          }
          return await getVercelOidcToken();
        },
      },
    });

    if (authClient) {
      (cred as any).authClient = authClient;
    }
  }

  return cred;
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: createAdminCredential(),
      projectId: PROJECT_ID,
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

const adminDb = getApps().length ? getFirestore() : null;
const adminAuth = getApps().length ? getAuth() : null;

export { adminDb, adminAuth };
