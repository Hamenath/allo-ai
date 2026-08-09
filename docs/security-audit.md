# ALLO — Security Audit Report

**Date:** 2026-08-09  
**Auditor:** Phase 27 — Automated + Manual Review  
**Scope:** Full codebase + config + CI/CD  
**Methodology:** Source code review, threat modelling, configuration inspection

> **Security is risk reduction, not a guarantee. This report reflects the findings at the time of audit and should be reviewed after any significant code or infrastructure change.**

---

## Threat Model

| Attacker | Capability |
|----------|-----------|
| Anonymous visitor | Public routes, unauthenticated API calls, webhook forgery |
| Authenticated free user | Own data, billing manipulation attempt, usage bypass, IDOR |
| Authenticated paid user | Same as above + higher trust assumption |
| Malicious/compromised user | Prompt injection, XSS, account takeover, CSRF |
| Admin impersonator | Admin API access, role escalation |
| External attacker | Webhook replay, bot signup, brute force, dependency exploit |

---

## CRITICAL Issues

> **NO CRITICAL ISSUES FOUND.**

No authentication bypass, no admin takeover, no unauthenticated data access, no payment manipulation, no webhook forgery vector, no hardcoded production secrets found.

---

## HIGH Issues — Fixed

### H-01: `updateUserProfile` accepted arbitrary trusted field writes (FIXED)
- **Location:** `src/lib/db/users.ts`
- **Impact:** If any caller ever passed `{ plan: "PRO" }` to `updateUserProfile()`, the Firestore client write would be blocked by Firestore rules, but the function itself did not enforce safe field restriction, creating a latent footgun.
- **Evidence:** Function accepted `Partial<UserProfile>` which includes `plan`, `role`, `usage`.
- **Fix:** Replaced with `SafeUserProfileUpdate` interface (only `name`, `photoURL`, `preferences`) and explicit field-by-field merge. Spread of unknown data is eliminated.
- **Status:** ✅ FIXED — `src/lib/db/users.ts`

---

## MEDIUM Issues — Fixed or Documented

### M-01: Missing HSTS Header (FIXED)
- **Location:** `next.config.ts`
- **Impact:** Without HSTS, first-time HTTP visitors are not upgraded to HTTPS at the browser level. Susceptible to SSL stripping on unprotected networks.
- **Fix:** Added `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- **Status:** ✅ FIXED

### M-02: Missing Cross-Origin Isolation Headers (FIXED)
- **Location:** `next.config.ts`
- **Impact:** Without COOP/CORP, cross-origin windows could observe ALLO's page state.
- **Fix:** Added `Cross-Origin-Opener-Policy: same-origin-allow-popups` (allows Razorpay and Firebase popups) and `Cross-Origin-Resource-Policy: same-origin`.
- **Status:** ✅ FIXED

### M-03: No Rate Limit on Public Razorpay Webhook Endpoint (FIXED)
- **Location:** `src/app/api/webhooks/razorpay/route.ts`
- **Impact:** Unauthenticated public endpoint could be flooded to exhaust server resources.
- **Fix:** Added 60 req/min rate limit keyed to `X-Forwarded-For`. All invalid signatures still rejected before processing.
- **Status:** ✅ FIXED

### M-04: `ADMIN_EMAIL` Not Documented in `.env.example` (FIXED)
- **Location:** `.env.example`
- **Impact:** Operators deploying ALLO without the `ADMIN_EMAIL` env var and without setting Firestore roles would have no admin access. Security-critical variable was undocumented.
- **Fix:** Added `ADMIN_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` with inline security notes.
- **Status:** ✅ FIXED

### M-05: `uuid` Dependency Vulnerability (MODERATE — Documented, Not Fixed)
- **Location:** `node_modules/uuid` (transitive via `firebase-admin`)
- **CVE:** GHSA-w5hq-g745-h8pq — Missing buffer bounds check in uuid v3/v5/v6 when `buf` is provided
- **Impact:** ALLO's code does not call `uuid.v3/v5/v6` with the `buf` parameter. The vulnerable code path is unused. Safe fix (`npm audit fix`) would downgrade `firebase-admin` to v10.3.0 (breaking change). Force-fix is not recommended at this stage.
- **Mitigation:** Monitor firebase-admin for an updated release that fixes the transitive dependency chain.
- **Status:** ⚠️ DOCUMENTED — Monitor and upgrade when firebase-admin releases a non-breaking fix

### M-06: No Content-Security-Policy Header (DOCUMENTED — Intentionally Deferred)
- **Location:** `next.config.ts`
- **Reason:** ALLO uses Firebase Auth popups, Razorpay checkout scripts loaded from `checkout.razorpay.com`, and Gemini API from multiple Google subdomains. A naive CSP would break these. A proper CSP requires per-route analysis and testing.
- **Risk:** Without CSP, injected scripts (if any XSS is found) can execute without restriction.
- **Mitigation:** ALLO uses React's default JSX escaping for all user-controlled output. No `dangerouslySetInnerHTML` is used except for static, server-controlled JSON-LD in `layout.tsx` (no user data).
- **Status:** ⚠️ DEFERRED — Implement CSP post-launch as a dedicated hardening sprint

---

## LOW Issues

### L-01: Error Message Leaks Env Var Names to Authenticated Users
- **Location:** `src/app/api/billing/create-subscription/route.ts` line 57
- **Impact:** Tells an authenticated user to add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Only shows when Razorpay is not configured — not a production concern.
- **Status:** ✅ Acceptable — this path is only reached if Razorpay is misconfigured, indicating a dev/staging environment

### L-02: Health Check Endpoint Leaks Application Name
- **Location:** `src/app/api/health/route.ts`
- **Impact:** Returns `service: "ALLO AI Workspace"`. Minimal information disclosure.
- **Status:** ✅ Acceptable — health endpoints are standard practice; no sensitive data exposed

### L-03: In-Memory Rate Limit Fallback Not Shared Across Instances
- **Location:** `src/lib/security/rate-limit.ts`
- **Impact:** With multiple server instances (Vercel edge functions), in-memory rate limit state is not shared. An attacker with multiple parallel requests routed to different instances could bypass per-instance limits.
- **Mitigation:** Upstash Redis distributed store is the production solution. Without Redis configured, rate limits are instance-local.
- **Status:** ⚠️ DOCUMENTED — Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in production

---

## INFORMATIONAL

### I-01: Admin Stats Exposes Boolean Config Flags to Admin
- **Location:** `src/app/api/admin/stats/route.ts` line 61
- Returns `isGeminiConfigured: Boolean(process.env.GEMINI_API_KEY)`. Admin-only, intended.

### I-02: `dangerouslySetInnerHTML` in Layout
- **Location:** `src/app/layout.tsx` line 73
- Used for JSON-LD structured data (`Organization` schema). Content is a static server-controlled constant with no user data interpolation. Safe usage.

### I-03: Firebase Client SDK Keys are Public
- **Location:** `src/lib/firebase.ts`
- `NEXT_PUBLIC_FIREBASE_*` keys are exposed to the client. This is by design — Firebase client keys are not secrets; Firestore and Storage security rules enforce access control.

### I-04: CI Workflow Uses Dummy Firebase Values in Build Step
- **Location:** `.github/workflows/ci.yml`
- Dummy `NEXT_PUBLIC_FIREBASE_*` values in CI build env. These are safe placeholder values for build-time verification only. No production secrets are present in CI.

---

## Security Control Assessment

### Authentication
| Control | Implementation | Status |
|---------|---------------|--------|
| Firebase Auth JWT tokens | `adminAuth.verifyIdToken()` on every protected API | ✅ |
| Token expiry enforced | Firebase handles short-lived tokens automatically | ✅ |
| Logout invalidates client state | `signOut(auth)` clears Firebase session | ✅ |
| Server-side auth (not client-only) | All API routes verify token server-side | ✅ |
| No middleware-only protection | API routes individually verify tokens | ✅ |

### Authorization
| Control | Implementation | Status |
|---------|---------------|--------|
| User-to-user data isolation | Firestore rules enforce `userId == request.auth.uid` | ✅ |
| Admin routes protected | `verifyAdminUser()` checks token + Firestore role | ✅ |
| Trusted field write protection | Firestore rules block `plan/role/subscriptionStatus` mutation | ✅ |
| Usage limit enforced server-side | `checkUsage()` called server-side before generation | ✅ |
| Plan config read from server only | Plan looked up from server DB, not client request | ✅ |

### IDOR
| Resource | Protection | Status |
|----------|-----------|--------|
| `aiGenerations/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `documents/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `favorites/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `notifications/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `usage/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `subscriptions/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |
| `paymentHistory/{docId}` | `resource.data.userId == request.auth.uid` | ✅ |

### Firestore Security Rules
| Collection | Client Read | Client Write | Server Only | Notes |
|-----------|------------|-------------|-------------|-------|
| `users` | Owner only | Owner (safe fields only) | Plan/role/status | Protected by Firestore rules |
| `aiGenerations` | Owner | Owner | — | userId validated both sides |
| `documents` | Owner | Owner | — | |
| `favorites` | Owner | Owner | — | |
| `notifications` | Owner | Owner (read-only field) | — | Only `read` field updatable |
| `usage` | Owner | ❌ false | Admin SDK | Write-blocked client-side |
| `subscriptions` | Owner | ❌ false | Admin SDK | Write-blocked client-side |
| `paymentHistory` | Owner | ❌ false | Admin SDK | Write-blocked client-side |
| `auditLogs` | ❌ false | ❌ false | Admin SDK | Fully server-only |
| `processedWebhooks` | ❌ false | ❌ false | Admin SDK | Fully server-only |

### Firebase Storage Security
| Path | Read | Write | Size Limit | Status |
|------|------|-------|-----------|--------|
| `users/{userId}/...` | Owner | Owner | 10MB | ✅ |
| Everything else | ❌ denied | ❌ denied | — | ✅ Default deny |

### API Security
| Route | Auth | Rate Limit | Input Validation | Method Guard | Status |
|-------|------|-----------|-----------------|-------------|--------|
| `POST /api/ai/generate` | ✅ JWT | ✅ 10/min + concurrency | ✅ Zod | POST only | ✅ |
| `POST /api/billing/create-subscription` | ✅ JWT | ✅ 5/min | ✅ Plan enum | POST only | ✅ |
| `POST /api/billing/verify` | ✅ JWT | ✅ 5/min | ✅ HMAC sig | POST only | ✅ |
| `POST /api/billing/cancel` | ✅ JWT | ✅ 5/min | ✅ Sub existence check | POST only | ✅ |
| `POST /api/webhooks/razorpay` | ✅ HMAC sig | ✅ 60/min (new) | ✅ Idempotency | POST only | ✅ |
| `GET /api/admin/*` | ✅ Admin JWT | ✅ 60/min | ✅ Admin role | GET only | ✅ |
| `POST /api/admin/users/[id]/status` | ✅ Admin JWT | ✅ 60/min | ✅ Field allowlist | POST only | ✅ |
| `GET /api/health` | ❌ Public | None | — | GET only | ✅ Intentional |

### Billing & Payment Security
| Control | Status |
|---------|--------|
| Payment signature HMAC verified server-side | ✅ |
| Webhook signature HMAC verified server-side | ✅ |
| Webhook idempotency via `processedWebhooks` collection | ✅ |
| Plan activated only after verified payment | ✅ |
| Card/CVV/bank credentials never stored | ✅ |
| Plan config read from server (not client `plan` param) | ✅ |

### AI Security
| Control | Status |
|---------|--------|
| Prompt injection guard in system instruction | ✅ |
| User input passed as passive data, not instructions | ✅ |
| Zod schema validates input before Gemini call | ✅ |
| AI output rendered as text via JSX, not HTML | ✅ |
| Structured output (JSON) prevents script injection | ✅ |
| Payload size cap 100KB before parsing | ✅ |
| Max 2 concurrent generations per user | ✅ |

### XSS
| Area | Status |
|------|--------|
| AI output rendered as JSX text (auto-escaped) | ✅ |
| User names/emails rendered as JSX text | ✅ |
| No markdown rendered as raw HTML | ✅ |
| `dangerouslySetInnerHTML` only for static JSON-LD | ✅ |
| No user data in `dangerouslySetInnerHTML` | ✅ |

### CSRF
| Status |
|--------|
| All mutating APIs use Bearer token auth (not cookies) | ✅ |
| Firebase ID tokens are not automatically sent by browser | ✅ |
| CSRF attacks cannot forge Bearer tokens from cross-origin | ✅ |

### CORS
| Status |
|--------|
| No permissive CORS wildcard (`*`) found on private APIs | ✅ |
| Default Next.js CORS policy (same-origin for API routes) | ✅ |

### Secrets
| Secret | Storage | Client Exposed | Status |
|--------|---------|---------------|--------|
| `GEMINI_API_KEY` | Env only | No | ✅ |
| `RAZORPAY_KEY_SECRET` | Env only | No | ✅ |
| `RAZORPAY_WEBHOOK_SECRET` | Env only | No | ✅ |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Env only | No | ✅ |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Env only | No | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Env only | No | ✅ |
| `RESEND_API_KEY` | Env only | No | ✅ |
| `ADMIN_EMAIL` | Env only | No | ✅ |
| Firebase client keys | `.env` + client bundle | Yes (by design) | ✅ |
| `.env` files in `.gitignore` | Yes | — | ✅ |

### Command Injection / Path Traversal / SQL Injection
| Control | Status |
|---------|--------|
| No `exec`, `spawn`, `child_process`, or `eval` found | ✅ |
| No SQL database — only Firestore | ✅ |
| No user-controlled file paths in server code | ✅ |
| Storage paths are Firebase SDK managed (no traversal) | ✅ |

### Open Redirects / SSRF
| Control | Status |
|---------|--------|
| No redirect parameter found in any route | ✅ |
| No user-provided URL fetching | ✅ |
| SSRF: Not Applicable | ✅ |

### Security Headers
| Header | Status |
|--------|--------|
| `X-Content-Type-Options: nosniff` | ✅ |
| `X-Frame-Options: DENY` | ✅ |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy: camera=(), microphone=(), geolocation=()` | ✅ |
| `Strict-Transport-Security` | ✅ Fixed in Phase 27 |
| `Cross-Origin-Opener-Policy` | ✅ Fixed in Phase 27 |
| `Cross-Origin-Resource-Policy` | ✅ Fixed in Phase 27 |
| `Content-Security-Policy` | ⚠️ Deferred — requires careful per-route config |

### CI/CD Security
| Control | Status |
|---------|--------|
| No production secrets in CI config | ✅ |
| Only dummy public Firebase keys in CI | ✅ |
| `actions/checkout@v4` (pinned major version) | ✅ |
| `actions/setup-node@v4` (pinned major version) | ✅ |
| No shell interpolation of user input | ✅ |
| No write access beyond repository | ✅ (default) |

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `uuid` moderate vuln (transitive via firebase-admin) | MEDIUM | Monitor firebase-admin releases; vuln path not called by ALLO |
| No Content-Security-Policy | MEDIUM | Plan CSP hardening post-launch after testing all external resource needs |
| In-memory rate limit not shared across instances | LOW | Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in production |
| Dependency supply chain (no Dependabot) | LOW | Enable Dependabot or equivalent on GitHub repository |
| Admin role in Firestore can be self-assigned if rules allow | N/A — blocked | Firestore rules block client write of `role` field |

---

## Launch Blockers

> **NO LAUNCH BLOCKERS REMAIN.**

All CRITICAL and HIGH findings have been fixed. Remaining items are MEDIUM or lower and have documented mitigations.

---

## Automated Checks

| Check | Result |
|-------|--------|
| ESLint | ✅ 0 errors |
| TypeScript | ✅ 0 errors |
| Vitest Tests | ✅ 15/15 passed |
| npm build | ✅ 61/61 routes compiled |
| npm audit | ⚠️ 6 moderate (transitive uuid via firebase-admin — safe fix requires breaking change) |

---

## Security Architecture Summary

```
Client (Browser)
    │
    ├── Firebase Auth (JWT tokens, short-lived)
    │
    │  [All tokens verified server-side via adminAuth.verifyIdToken()]
    │
API Routes (Next.js / Vercel Edge)
    ├── /api/ai/generate    → Auth + Rate Limit + Zod + Usage Check → Gemini
    ├── /api/billing/*      → Auth + Rate Limit + HMAC → Razorpay / Firestore
    ├── /api/webhooks/*     → HMAC Sig + Rate Limit + Idempotency → Firestore
    ├── /api/admin/*        → Admin Auth (JWT + Firestore role) → Firestore Admin SDK
    └── /api/health         → Public, no secrets
    │
Firestore (Firebase)
    ├── Security rules: default deny-all
    ├── User data: owner-isolated
    ├── Trusted fields: server-write only (plan, role, subscriptionStatus)
    └── Admin/system collections: Admin SDK only
    │
Firebase Storage
    ├── Default deny-all
    ├── User paths: owner-isolated, 10MB limit
    └── No public read/write paths
```
