# ALLO — Production Readiness Matrix

This matrix tracks the readiness status of all infrastructure, security, billing, and code subsystems prior to live launch on `https://alloai.in`.

---

## Production Readiness Status Matrix

| Subsystem | Readiness Status | Action / Requirement |
| :--- | :--- | :--- |
| **Application Codebase** | **READY** | All 60 Next.js routes compile cleanly; TypeScript & Vitest suites pass 100%. |
| **Firebase Auth & Firestore** | **READY** | `firestore.rules` & `storage.rules` enforced with default deny all and user isolation. |
| **Gemini AI Engine** | **READY** | Robust API error fallback handling and rate limiting configured. |
| **Razorpay Billing** | **READY** | Webhook verification, signature HMAC validation, and subscription management verified. |
| **Email Infrastructure** | **READY** | Resend API abstraction & template fallback configured. |
| **Rate Limiting Engine** | **READY** | Upstash Redis sliding window with in-memory fallback store operational. |
| **Legal & Compliance** | **READY** | Public pages (`/privacy`, `/terms`, `/refund-policy`, `/cookie-policy`, `/ai-disclaimer`) active. |
| **Production Domain & SSL** | **PRODUCTION CONFIGURATION REQUIRED** | DNS A/CNAME records and SSL certificate binding required on launch day. |
| **Production Secrets** | **PRODUCTION CONFIGURATION REQUIRED** | Live Razorpay API Keys & Production Firebase Admin Key to be set in Vercel. |
| **GCP Firestore PITR Backups** | **PRODUCTION CONFIGURATION REQUIRED** | GCP Firestore automated export schedule to be activated in GCP Console. |
