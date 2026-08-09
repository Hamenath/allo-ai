# ALLO — Production Deployment Specification

This document provides deployment guidelines for hosting **ALLO** on Vercel or Node.js serverless platforms.

---

## 1. Target Infrastructure & Target Domain
- **Target Domain**: `https://alloai.in`
- **Canonical App URL**: `https://alloai.in`
- **Framework**: Next.js 16 (App Router)
- **Node Version**: Node.js 20.x

---

## 2. Pre-Deployment Verification Checklist
1. **Environment Variables**: Populate all required server and public variables in Vercel / Platform settings (see `docs/environment.md`).
2. **Firebase Rules Deployment**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
3. **Razorpay Webhook Configuration**:
   - Webhook URL: `https://alloai.in/api/webhooks/razorpay`
   - Active Events: `subscription.charged`, `subscription.cancelled`, `payment.failed`
4. **Domain DNS Settings**:
   - `A Record`: Points to hosting edge IP
   - `CNAME Record`: `www.alloai.in` -> `alloai.in`

---

## 3. Deployment Command Sequence
```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Automated Test Suite
npm test

# 3. Production Build Compilation
npm run build
```

---

## 4. Rollback Procedure
1. If a production regression occurs, execute instant deployment rollback via Vercel CLI or Dashboard to the previous deployment ID.
2. In case of database security issues, immediately redeploy `firestore.rules`.
