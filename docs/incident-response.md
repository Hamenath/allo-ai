# ALLO — Incident Response Runbook

**Owner:** ALLO Operations Team  
**Version:** 1.0 — 2026-08-09  
**Confidentiality:** Internal only. Do NOT commit actual credentials to this document.

> This document provides step-by-step guidance for responding to security incidents affecting the ALLO platform. Each scenario includes detection, containment, eradication, recovery, and post-mortem steps.

---

## Severity Classification

| Severity | Definition | Response Time |
|----------|-----------|--------------|
| P0 — Critical | Active exploitation, data breach, payment compromise | Immediate (< 1 hour) |
| P1 — High | Credible threat, confirmed vulnerability | < 4 hours |
| P2 — Medium | Limited exploitation, weak security control | < 24 hours |
| P3 — Low | Minor issue, no active exploitation | < 1 week |

---

## Incident Response Process

For all incidents:

1. **Detect** — Identify the issue
2. **Contain** — Stop the bleeding immediately
3. **Assess** — Determine scope and impact
4. **Eradicate** — Remove the root cause
5. **Recover** — Restore normal service
6. **Post-Mortem** — Document and learn

---

## Scenario 1: API Key Leaked (Gemini / Razorpay / Resend)

### Detection
- Unauthorized AI usage spike
- Unexpected billing charges
- Alert from provider
- Committed secret found in Git history

### Immediate Containment
1. **Gemini:** Go to Google Cloud Console → APIs & Services → Credentials → Revoke the key immediately
2. **Razorpay:** Log into Razorpay Dashboard → Settings → API Keys → Regenerate
3. **Resend:** Log into Resend Dashboard → API Keys → Delete and recreate
4. **Upstash Redis:** Rotate token in Upstash Console

### Eradication
- Remove secret from Git history using `git filter-repo` or BFG Repo Cleaner
- Force-push cleaned history (coordinate with any team members)
- Review Git log for all commits containing the secret

### Recovery
1. Set new secret in Vercel environment variables (Production + Preview)
2. Trigger a redeployment
3. Verify the new key works by checking a safe admin endpoint

### Post-Mortem
- Add the leaked secret to your password manager's breach watchlist
- Review `.gitignore` to confirm `.env*` is excluded
- Audit recent API usage logs for unauthorized access

---

## Scenario 2: Firebase Admin SDK Credentials Compromised

### Detection
- Unexpected Firestore writes (plan changes, role elevations)
- Unknown users created
- Admin SDK used from unknown IP
- Firebase security alerts

### Immediate Containment
1. Log into [Firebase Console](https://console.firebase.google.com)
2. **IAM & Admin → Service Accounts** → Find the ALLO service account
3. **Disable the service account** immediately
4. Generate a new service account key

### Eradication
- Audit all recent Firestore writes in the Firebase Console
- Check `auditLogs` collection in Firestore for unauthorized admin actions
- Review `users` collection for unexpected role/plan changes

### Recovery
1. Create a new service account key (JSON)
2. Update `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID` in Vercel
3. Redeploy
4. Revert any unauthorized Firestore changes using backup data or manual review

### Post-Mortem
- Enable Firebase Security Alerts
- Consider restricting service account scope to minimum required permissions

---

## Scenario 3: Razorpay Webhook Attack / Replay

### Detection
- Multiple duplicate payment events
- Subscriptions activated without corresponding payments
- Unusual entries in `processedWebhooks` collection
- Razorpay signature verification failures in logs

### Immediate Containment
1. Check if `RAZORPAY_WEBHOOK_SECRET` is correctly set (missing secret → all webhooks fail signature check → rejected)
2. Review `processedWebhooks` Firestore collection for duplicate events
3. Review `subscriptions` and `paymentHistory` collections for anomalies

### If Replay Attack Confirmed
1. The idempotency check (`isWebhookProcessed`) should prevent duplicate processing
2. If duplicates exist in Firestore, manually revert affected subscription records using Firebase Admin SDK or Console

### Recovery
1. Rotate `RAZORPAY_WEBHOOK_SECRET` in Razorpay Dashboard → Webhooks → Edit
2. Update the new secret in Vercel environment variables
3. Redeploy

### Post-Mortem
- Verify idempotency records are retained for at least 90 days
- Consider adding webhook event logging to `auditLogs`

---

## Scenario 4: User Data Exposed (IDOR or Firestore Rules Bypass)

### Detection
- User reports seeing another user's documents
- Unexpected read patterns in Firebase Usage Monitor
- Security researcher report

### Immediate Assessment
1. Identify which Firestore collection is affected
2. Review the specific Firestore security rule for that collection
3. Check if any API route returns data without userId verification

### Containment
1. If a Firestore rule is overly broad, immediately tighten it in `firestore.rules`
2. Deploy updated rules via `firebase deploy --only firestore:rules`
3. If an API route is the issue, deploy a hotfix immediately

### Notification
- If real user PII was exposed to another user:
  - Notify affected users within 72 hours (GDPR-aligned best practice)
  - Document the incident and scope
  - Contact `privacy@alloai.in`

### Recovery
1. Audit affected data to determine full scope
2. Apply fixes to rules and/or API routes
3. Test the fix thoroughly before declaring resolved

---

## Scenario 5: AI Abuse / Prompt Injection

### Detection
- AI output containing suspicious content (credentials, internal instructions)
- Usage spike for a single user
- User-reported unexpected AI behavior

### Immediate Containment
1. If a user is clearly abusing: disable their account via `/admin` → Users → Disable
2. Check rate limit logs for that user
3. Review recent `aiGenerations` documents for the affected user

### Eradication
- Strengthen the anti-injection system instruction in `src/app/api/ai/generate/route.ts` if bypassed
- Add input pattern matching to reject known attack strings if necessary

### Recovery
- No production data is at risk from prompt injection unless AI output is stored and rendered unsafely
- ALLO renders AI output as text (JSX-escaped), not raw HTML — limited secondary impact

---

## Scenario 6: Admin Account Compromised

### Detection
- Unauthorized admin actions in `auditLogs` collection
- User accounts disabled/enabled unexpectedly
- Unknown role changes in Firestore

### Immediate Containment
1. If admin access is via `ADMIN_EMAIL`: change the email in Vercel environment variables and redeploy immediately
2. If admin access is via Firestore `role: "admin"`: update the user document to `role: "user"`
3. Revoke Firebase Auth session: Firebase Console → Authentication → [User] → Revoke sessions

### Eradication
- Review all actions in `auditLogs` from the time of suspected compromise
- Revert any unauthorized changes

### Recovery
1. Rotate Firebase Admin SDK credentials (see Scenario 2)
2. Review and tighten admin access controls
3. Consider requiring Firebase custom claims for admin (instead of Firestore role only)

---

## Scenario 7: Production Deployment Compromised

### Detection
- Unexpected code in production
- Unauthorized Vercel deployments
- Unknown environment variable changes
- GitHub Actions logs showing unexpected steps

### Immediate Containment
1. **Vercel:** Go to Vercel Dashboard → Deployments → Roll back to the last known good deployment immediately
2. **GitHub:** Review recent commits and pull requests
3. Revoke any GitHub personal access tokens associated with the deployment

### Eradication
- Audit GitHub Actions workflow permissions
- Review all GitHub repository access tokens
- Rotate all production secrets (assume they may be compromised)

### Recovery
1. Deploy from a verified clean commit
2. Rotate all secrets (see Scenario 1 + 2)
3. Review Vercel team access and revoke unknown members

---

## Secret Rotation Runbook

### Gemini API Key
1. Google Cloud Console → APIs & Services → Credentials
2. Delete old key, create new key
3. Update `GEMINI_API_KEY` in Vercel → Settings → Environment Variables
4. Redeploy production

### Firebase Admin Key
1. Firebase Console → Project Settings → Service Accounts → Generate new private key
2. Download JSON (store securely — never commit)
3. Update `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID` in Vercel
4. Redeploy

### Razorpay Keys
1. Razorpay Dashboard → Settings → API Keys → Regenerate
2. Update `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in Vercel
3. Update webhook secret: Razorpay Dashboard → Webhooks → Regenerate Secret
4. Update `RAZORPAY_WEBHOOK_SECRET` in Vercel
5. Redeploy

### Upstash Redis Token
1. Upstash Console → Your database → REST API → Rotate token
2. Update `UPSTASH_REDIS_REST_TOKEN` in Vercel
3. Redeploy

### Resend API Key
1. Resend Dashboard → API Keys → Delete old, create new
2. Update `RESEND_API_KEY` in Vercel
3. Redeploy

### Admin Email (ADMIN_EMAIL)
1. Update `ADMIN_EMAIL` in Vercel to the new admin email address
2. Ensure the new email is registered in Firebase Auth and has verified ownership
3. Redeploy

---

## Contact Information

| Role | Contact |
|------|---------|
| Support | support@alloai.in |
| Privacy | privacy@alloai.in |
| Legal | legal@alloai.in |
| Firebase | [Firebase Console](https://console.firebase.google.com) |
| Razorpay | [Razorpay Dashboard](https://dashboard.razorpay.com) |
| Vercel | [Vercel Dashboard](https://vercel.com/dashboard) |
| Google Cloud | [Cloud Console](https://console.cloud.google.com) |

---

## Post-Incident Requirements

After every P0/P1 incident:

- [ ] Incident timeline documented
- [ ] Root cause identified and fixed
- [ ] Affected users notified (if applicable)
- [ ] Secrets rotated (if compromised)
- [ ] Security controls strengthened
- [ ] Test added to prevent regression
- [ ] Post-mortem written and stored in `docs/`
