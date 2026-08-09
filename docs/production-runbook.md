# ALLO — Production Operations Runbook

This runbook documents incident response protocols, operational procedures, and troubleshooting steps for platform incidents on **ALLO** (`https://<project-name>.vercel.app`).

> **Domain Note:** Custom domain `alloai.in` is **NOT PURCHASED YET**.  
> Primary deployment target is Vercel (`https://<project-name>.vercel.app`).  
> When `alloai.in` is purchased, follow [`docs/custom-domain-plan.md`](custom-domain-plan.md).

---

## 1. Incident Response Protocols

### 1.1 Gemini AI Provider Outages
- **Symptom**: Elevated 503 errors on `/api/ai/generate` or user interface displaying "AI service temporarily unavailable".
- **Mitigation**:
  1. Check status on Google AI Studio / Gemini API Dashboard.
  2. The system automatically surfaces user-friendly error banners without corrupting user generation history or consuming monthly usage limits.
  3. If rate limits are exceeded on the API key, trigger key rotation as outlined in `docs/disaster-recovery.md`.

---

### 1.2 Razorpay Webhook Failures
- **Symptom**: Users upgrade to Pro/Business, but plan status remains `FREE` in dashboard.
- **Mitigation**:
  1. Inspect Razorpay Webhook Logs in Razorpay Dashboard (`https://dashboard.razorpay.com`).
  2. Verify payload signature matches `RAZORPAY_WEBHOOK_SECRET`.
  3. Re-send failed webhook events via Razorpay Webhook Dashboard. All endpoints use `processedWebhooks` for safe idempotency.

---

### 1.3 Firebase Authentication or Firestore Errors
- **Symptom**: User login fails or document queries return permission denied.
- **Mitigation**:
  1. Verify Cloud Firestore Status in Firebase Console (`https://console.firebase.google.com`).
  2. Inspect deployment logs for `FIREBASE_ADMIN_PRIVATE_KEY` formatting errors (`\n` newline escaping).
  3. Verify `firestore.rules` security policies.

---

### 1.4 Rate Limiter / Redis Service Interruptions
- **Symptom**: High latency or Redis REST connection timeouts.
- **Mitigation**:
  - The system automatically falls back to in-memory sliding window rate-limiting if Upstash Redis connection fails (`checkRateLimit` memory store fallback).

---

## 2. Health Monitoring
- Public Uptime Health Check Endpoint: `GET https://<project-name>.vercel.app/api/health`
- Expected Payload: `{ "status": "ok", "service": "ALLO AI Workspace" }`
