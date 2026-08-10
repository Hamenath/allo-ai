import {
  getApps,
  initializeApp,
  applicationDefault,
  cert,
  type App,
  type Credential,
  type GoogleOAuthAccessToken,
} from "firebase-admin/app";
import { ExternalAccountClient, type BaseExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const PROJECT_ID =
  process.env.GCP_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "allo-ai-798fe";

// Retrieve internal ApplicationDefaultCredential class reference for inheritance
const ApplicationDefaultCredentialClass = applicationDefault().constructor as new (
  ...args: any[]
) => Credential;

class WifAdminCredential extends ApplicationDefaultCredentialClass implements Credential {
  private wifAuthClient: BaseExternalAccountClient;

  constructor(authClient: BaseExternalAccountClient) {
    super();
    this.wifAuthClient = authClient;
    (this as any).authClient = authClient;
  }

  async getAccessToken(): Promise<GoogleOAuthAccessToken> {
    const result = await this.wifAuthClient.getAccessToken();

    if (!result.token) {
      throw new Error(
        "Google Workload Identity Federation returned no access token."
      );
    }

    return {
      access_token: result.token,
      expires_in: 3600,
    };
  }
}

function createWifCredential(): Credential {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId =
    process.env.GCP_WORKLOAD_IDENTITY_PROVIDER_ID ||
    process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  if (!projectNumber || !poolId || !providerId || !serviceAccountEmail) {
    throw new Error(
      "Missing Google Cloud Workload Identity Federation environment variables."
    );
  }

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

  if (!authClient) {
    throw new Error(
      "Failed to initialize Google ExternalAccountClient for Workload Identity Federation."
    );
  }

  return new WifAdminCredential(authClient);
}

function createAdminCredential(): Credential {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  // 1. Explicit Service Account Key (if provided in environment variables)
  if (privateKey && clientEmail) {
    return cert({
      projectId: PROJECT_ID,
      clientEmail: clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    });
  }

  // 2. Local development fallback (ADC) when VERCEL environment is absent
  if (!process.env.VERCEL) {
    return applicationDefault();
  }

  // 3. Vercel production: Vercel OIDC -> Google WIF -> Service Account
  return createWifCredential();
}

export function getAdminApp(): App | null {
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

  return getApps().length ? getApps()[0] : null;
}
