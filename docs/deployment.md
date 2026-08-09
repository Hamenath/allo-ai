# ALLO — Vercel Production Deployment Specification

This document provides production deployment guidelines for hosting **ALLO** on Vercel.

---

## 1. Target Infrastructure & Production URL
- **Hosting Platform**: Vercel (Edge / Serverless)
- **Current Production Domain**: `https://<project-name>.vercel.app` (Vercel-generated production URL)
- **Custom Domain Status**: **NOT PURCHASED YET** (`alloai.in` is unpurchased — see [`docs/custom-domain-plan.md`](custom-domain-plan.md) for future migration steps)
- **Application URL Env Var**: `NEXT_PUBLIC_APP_URL=https://<project-name>.vercel.app`
- **Framework**: Next.js 16 (App Router)
- **Node Version**: Node.js 20.x

---

## 2. Pre-Deployment Verification Checklist
1. **Environment Variables**: Populate all required server and public variables in Vercel Project Settings (see [`docs/environment.md`](environment.md)).
   - Ensure `NEXT_PUBLIC_APP_URL` is set to your actual Vercel production URL.
2. **Firebase Rules Deployment**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
3. **Razorpay Webhook Configuration**:
   - Webhook URL: `https://<project-name>.vercel.app/api/webhooks/razorpay`
   - Active Events: `payment.captured`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `order.paid`
4. **Domain Configuration**:
   - Primary domain is managed dynamically by Vercel (`.vercel.app`).
   - Do NOT configure custom DNS until domain is purchased.

---

## 3. Deployment Command Sequence
```bash
# 1. Typecheck
npm run typecheck

# 2. Automated Test Suite
npm test

# 3. Production Build Compilation
npm run build
```

---

## 4. Rollback Procedure
1. If a production regression occurs, execute instant deployment rollback via Vercel Dashboard → Deployments to the previous deployment ID.
2. In case of database security issues, immediately redeploy `firestore.rules`.
3. See [`docs/incident-response.md`](incident-response.md) for full emergency procedures.
