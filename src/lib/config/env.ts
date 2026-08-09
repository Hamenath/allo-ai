/**
 * Safe Environment Variable Validation & Configuration
 * Ensures required variables are verified at startup without leaking secrets.
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
}

export function validateEnvironment(isProduction = process.env.NODE_ENV === "production"): EnvValidationResult {
  const missing: string[] = [];

  // Public variables required in all environments
  const requiredPublic = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_APP_URL",
  ];

  for (const key of requiredPublic) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Server-side variables required in production
  if (isProduction) {
    const requiredServer = [
      "GEMINI_API_KEY",
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "RAZORPAY_WEBHOOK_SECRET",
      "FIREBASE_ADMIN_PROJECT_ID",
      "FIREBASE_ADMIN_CLIENT_EMAIL",
      "FIREBASE_ADMIN_PRIVATE_KEY",
    ];

    for (const key of requiredServer) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

export const APP_CONFIG = {
  appName: "ALLO",
  canonicalUrl: "https://alloai.in",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://alloai.in",
  isProduction: process.env.NODE_ENV === "production",
};
