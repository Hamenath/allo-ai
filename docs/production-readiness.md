# ALLO — Production Readiness Matrix

This matrix tracks the readiness status of all infrastructure, security, billing, and code subsystems prior to live launch on Vercel (`https://<project-name>.vercel.app`).

> **Domain Note:** Custom domain `alloai.in` is **NOT PURCHASED YET**.  
> Primary deployment target is Vercel (`https://<project-name>.vercel.app`).  
> When `alloai.in` is purchased, follow [`docs/custom-domain-plan.md`](custom-domain-plan.md).

---

## Production Readiness Status Matrix

| Subsystem | Readiness Status | Action / Requirement |
| :--- | :--- | :--- |
| **Application Codebase** | **READY** | All Next.js routes compile cleanly; TypeScript & Vitest suites pass 100%. |
| **Firebase Auth & Firestore** | **READY** | `firestore.rules` & `storage.rules` enforced with default deny all and user isolation. |
| **Gemini AI Engine** | **READY** | Robust API error fallback handling and rate limiting configured. |
| **Razorpay Billing** | **READY** | Webhook verification, signature HMAC validation, and subscription management verified. |
| **Email Infrastructure** | **READY** | Resend API abstraction & template fallback configured. |
| **Rate Limiting Engine** | **READY** | Upstash Redis sliding window with in-memory fallback store operational. |
| **Legal & Compliance** | **READY** | Public pages (`/privacy`, `/terms`, `/refund-policy`, `/cookie-policy`, `/ai-disclaimer`) active. |
| **Vercel Hosting & SSL** | **READY** | Automated SSL certificate & deployment via Vercel edge network. |
| **Custom Domain (`alloai.in`)** | **NOT PURCHASED YET** | Follow `docs/custom-domain-plan.md` when domain is acquired in the future. |
| **Production Secrets** | **CONFIGURED IN VERCEL** | Live Razorpay API Keys & Production Firebase Admin Key set in Vercel. |
| **GCP Firestore Backups** | **RECOMMENDED** | GCP Firestore automated export schedule to be activated in GCP Console. |
