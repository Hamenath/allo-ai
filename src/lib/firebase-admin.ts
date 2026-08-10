import { getApps, initializeApp, cert, Credential } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

function getCredential(): Credential | undefined {
  // 1. Private Key (Legacy / local env fallback if explicitly provided)
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return cert({
      projectId:
        process.env.GCP_PROJECT_ID ||
        process.env.FIREBASE_ADMIN_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        "allo-ai-798fe",
      clientEmail:
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
        process.env.GCP_SERVICE_ACCOUNT_EMAIL ||
        "",
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  // 2. Keyless Workload Identity Federation (Vercel OIDC -> GCP WIF)
  const gcpProjectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId =
    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER_ID ||
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  if (gcpProjectNumber && poolId && providerId && serviceAccountEmail) {
    const audience = `//iam.googleapis.com/projects/${gcpProjectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

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
      return {
        getAccessToken: async () => {
          const res = await authClient.getAccessToken();
          return {
            access_token: res.token || "",
            expires_in: 3600,
          };
        },
      };
    }
  }

  return undefined;
}

// Create a singleton initialization pattern to avoid repeated initialization during development
if (!getApps().length) {
  try {
    const projectId =
      process.env.GCP_PROJECT_ID ||
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      "allo-ai-798fe";

    const credential = getCredential();

    initializeApp({
      ...(credential ? { credential } : {}),
      projectId,
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

const adminDb = getApps().length ? getFirestore() : null;
const adminAuth = getApps().length ? getAuth() : null;

export { adminDb, adminAuth };
