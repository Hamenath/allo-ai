const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const LEGAL_CONFIG = {
  appName: "ALLO",
  brandName: "ALLO",
  domain: typeof window !== "undefined" ? window.location.hostname : (process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : "localhost"),
  websiteUrl: defaultAppUrl,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@example.com",
  legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@example.com",
  termsVersion: "2026-01",
  privacyVersion: "2026-01",
  refundVersion: "2026-01",
  lastUpdated: "August 9, 2026",
  providers: {
    authentication: "Firebase Auth",
    database: "Google Cloud Firestore",
    aiEngine: "Google Gemini AI",
    paymentGateway: "Razorpay (India)",
    emailProvider: "Resend",
  },
};
