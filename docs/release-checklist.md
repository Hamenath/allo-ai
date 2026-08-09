# ALLO — Release Checklist

Use this checklist before every production release.

> **Note on Production Domain:** Custom domain `alloai.in` is **NOT PURCHASED YET**.  
> Primary deployment target is Vercel (`https://<project-name>.vercel.app`).  
> When `alloai.in` is purchased, follow [`docs/custom-domain-plan.md`](custom-domain-plan.md).

---

## Pre-Release Verification

### Code Quality
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 TypeScript errors
- [ ] `npm test` — all tests pass
- [ ] `npm run build` — production build succeeds with 0 errors

### Security
- [ ] `npm audit` — no CRITICAL or HIGH vulnerabilities unresolved
- [ ] No secrets committed to the repository (`git log` scan)
- [ ] All API routes that access user data verify Firebase ID token server-side
- [ ] Firestore security rules deployed: `firebase deploy --only firestore:rules`
- [ ] Firebase Storage rules deployed: `firebase deploy --only storage:rules`
- [ ] Razorpay webhook signature verification active
- [ ] Rate limiting confirmed active (Redis configured in production)

### Environment
- [ ] All required environment variables set in Vercel (production environment)
  - [ ] `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
  - [ ] `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`
  - [ ] `GEMINI_API_KEY`
  - [ ] `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - [ ] `RESEND_API_KEY`
  - [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `ADMIN_EMAIL`
  - [ ] `NEXT_PUBLIC_APP_URL=https://<project-name>.vercel.app`
- [ ] `.env.example` is up-to-date with all variable names

### Database
- [ ] Firestore indexes deployed: `firebase deploy --only firestore:indexes`
- [ ] No breaking schema changes without a migration plan
- [ ] Admin account has correct `role: "admin"` in Firestore or `ADMIN_EMAIL` is set

### Billing
- [ ] Razorpay webhook URL configured: `https://<project-name>.vercel.app/api/webhooks/razorpay`
- [ ] Webhook events active: `payment.captured`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `order.paid`
- [ ] Webhook secret matches `RAZORPAY_WEBHOOK_SECRET`
- [ ] Tested a payment flow end-to-end in staging

### AI
- [ ] Gemini API key active and has sufficient quota
- [ ] All 15+ tools tested with valid inputs
- [ ] Usage limits enforced (free: 10, pro: 500, business: unlimited)

### Email
- [ ] Resend API key active
- [ ] `EMAIL_FROM` domain is verified in Resend
- [ ] Test email sent successfully

### Domain & Hosting
- [ ] Vercel URL (`https://<project-name>.vercel.app`) resolves correctly
- [ ] HTTPS is enforced (Vercel handles this automatically)
- [ ] HSTS header present in production response

### Monitoring & Observability
- [ ] Vercel deployment logs accessible
- [ ] Firebase Console access confirmed
- [ ] Error rates baseline established

### Documentation
- [ ] `CHANGELOG.md` updated with release notes
- [ ] `README.md` is accurate and up-to-date
- [ ] `docs/` documentation reflects current implementation

---

## Release Steps

```bash
# 1. Ensure main is clean and all checks pass
git checkout main
git pull origin main

# 2. Run full verification
npm run typecheck
npm run lint
npm test
npm run build

# 3. Create and push the release tag
git tag -a v1.0.0 -m "Release v1.0.0 — First production release"
git push origin v1.0.0
```

---

## Post-Release Verification

- [ ] Vercel deployment succeeded (check Vercel dashboard)
- [ ] Vercel URL loads correctly
- [ ] Login and signup work
- [ ] At least one AI generation completes successfully
- [ ] Billing flow initiates correctly
- [ ] Admin panel accessible to admin account
- [ ] No critical errors in Vercel logs

---

## Rollback Procedure

If a critical issue is discovered post-deployment:

1. **Immediate:** Roll back via Vercel Dashboard → Deployments → previous deployment → Redeploy
2. **Tag:** If the release tag is broken, do NOT delete it — create a `v1.0.1` fix release
3. **Database:** Git rollback does NOT roll back Firestore data — assess data impact separately
4. **Notify:** Inform affected users if user data was impacted

See [`docs/incident-response.md`](incident-response.md) for detailed incident procedures.
