# ALLO — Environment Variables Specification

This document provides a full environment inventory for **ALLO**, explaining every environment variable, whether it is client-exposed (`NEXT_PUBLIC_`) or server-only, and its default development vs. production requirements.

---

## Environment Inventory

| Variable Name | Scope | Purpose | Required in Prod? | Development Default | Production Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public | Application base URL | Yes | `http://localhost:3000` | `https://alloai.in` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | Firebase Client API Key | Yes | Staging / Dev Key | Production Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Firebase Auth Domain | Yes | `allo-dev.firebaseapp.com` | `alloai.in` / `allo-prod.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | Firebase Project ID | Yes | `allo-dev` | `allo-prod` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | Firebase Storage Bucket | Yes | `allo-dev.appspot.com` | `allo-prod.appspot.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public | Razorpay Key ID | Yes | `rzp_test_...` | `rzp_live_...` |
| `GEMINI_API_KEY` | Server | Google Gemini API Key | Yes | Dev API Key | Production API Key |
| `RAZORPAY_KEY_ID` | Server | Razorpay Key ID | Yes | `rzp_test_...` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Server | Razorpay Key Secret | Yes | `rzp_test_secret_...` | `rzp_live_secret_...` |
| `RAZORPAY_WEBHOOK_SECRET` | Server | Razorpay Webhook Secret | Yes | Test Webhook Secret | Live Webhook Secret |
| `FIREBASE_ADMIN_PROJECT_ID` | Server | Firebase Admin Project ID | Yes | `allo-dev` | `allo-prod` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server | Firebase Admin Service Email | Yes | `dev-sa@...` | `prod-sa@...` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server | Firebase Admin Private Key | Yes | Dev Private Key | Production Private Key |
| `EMAIL_PROVIDER` | Server | Email Provider Key (`resend` / `smtp`) | No | `resend` | `resend` |
| `RESEND_API_KEY` | Server | Resend API Secret Key | No (Optional) | `re_test_...` | Live Resend API Key |
| `EMAIL_FROM` | Server | Transactional Email From Address | Yes | `notifications@alloai.in` | `notifications@alloai.in` |
| `EMAIL_REPLY_TO` | Server | Transactional Reply-To Address | Yes | `support@alloai.in` | `support@alloai.in` |
| `UPSTASH_REDIS_REST_URL` | Server | Redis REST endpoint | No (Optional) | `https://...upstash.io` | Live Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Redis REST Bearer Token | No (Optional) | Dev Redis Token | Live Redis Token |

---

## Security & Exposure Rules
- **NEVER** expose `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, or `FIREBASE_ADMIN_PRIVATE_KEY` using `NEXT_PUBLIC_`.
- Server environment variables are accessible strictly within Next.js API route handlers (`src/app/api/*`) and server utilities.
