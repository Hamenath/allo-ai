import {
  getApps,
  initializeApp,
  applicationDefault,
  type Credential,
  type GoogleOAuthAccessToken,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const PROJECT_ID =
  process.env.GCP_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "allo-ai-798fe";

function createWifCredential(): Credential {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId =
    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER_ID ||
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  if (
    !projectNumber ||
    !poolId ||
    !providerId ||
    !serviceAccountEmail
  ) {
    throw new Error(
      "Missing Google Cloud Workload Identity Federation environment variables."
    );
  }

  const audience =
    `//iam.googleapis.com/projects/${projectNumber}` +
    `/locations/global/workloadIdentityPools/${poolId}` +
    `/providers/${providerId}`;

  const authClient = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",

    service_account_impersonation_url:
      `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/` +
      `${serviceAccountEmail}:generateAccessToken`,

    subject_token_supplier: {
      getSubjectToken: getVercelOidcToken,
    },
  });

  if (!authClient) {
    throw new Error(
      "Failed to initialize Google ExternalAccountClient for Workload Identity Federation."
    );
  }

  return {
    async getAccessToken(): Promise<GoogleOAuthAccessToken> {
      const result = await authClient.getAccessToken();

      if (!result.token) {
        throw new Error(
          "Google Workload Identity Federation returned no access token."
        );
      }

      return {
        access_token: result.token,
        expires_in: 3600,
      };
    },
  };
}

function createAdminCredential(): Credential {
  // Local development:
  // Uses Google Application Default Credentials.
  if (!process.env.VERCEL) {
    return applicationDefault();
  }

  // Vercel production:
  // Vercel OIDC → Google WIF → Service Account.
  return createWifCredential();
}

if (!getApps().length) {
  initializeApp({
    credential: createAdminCredential(),
    projectId: PROJECT_ID,
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };
