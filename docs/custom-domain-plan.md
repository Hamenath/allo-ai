# ALLO — Custom Domain Migration Plan (`alloai.in`)

> **Current Status:** Custom domain `alloai.in` is **NOT PURCHASED YET**.  
> The current production application is deployed on Vercel (`https://<project-name>.vercel.app`).

This document outlines the exact 14-step procedure to execute when the custom domain `alloai.in` is purchased in the future.

---

## 14-Step Migration Checklist

When `alloai.in` is purchased, perform the following steps in order:

- [ ] **Step 1: Domain Purchase & Vercel Domains Configuration**
  - Register `alloai.in` at domain registrar (e.g. Namecheap, GoDaddy, Cloudflare).
  - Open Vercel Dashboard → Select Project (`allo-ai`) → **Settings** → **Domains**.
  - Add `alloai.in` and `www.alloai.in`.

- [ ] **Step 2: DNS Records Configuration**
  - At domain registrar's DNS management panel:
    - **A Record:** `@` → `76.76.21.21` (Vercel IP)
    - **CNAME Record:** `www` → `cname.vercel-dns.com`

- [ ] **Step 3: Domain Verification**
  - Verify domain ownership in Vercel.
  - Wait for DNS propagation (typically 5 to 30 minutes).

- [ ] **Step 4: Enable HTTPS & SSL Certificate**
  - Confirm Vercel automatically issues Let's Encrypt SSL certificate for `alloai.in` and `www.alloai.in`.
  - Verify `https://alloai.in` loads securely without SSL warnings.

- [ ] **Step 5: Update Vercel Environment Variables**
  - Update `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables (Production) to `https://alloai.in`.

- [ ] **Step 6: Update Canonical URLs & Metadata**
  - Confirm `src/app/layout.tsx`, `src/lib/config/legal.ts`, and `src/lib/config/env.ts` pick up `NEXT_PUBLIC_APP_URL`.

- [ ] **Step 7: Update Sitemap & Robots**
  - Confirm `sitemap.xml` and `robots.txt` output `https://alloai.in` base URLs.

- [ ] **Step 8: Update Open Graph & Social Sharing Tags**
  - Verify Open Graph `og:url` metadata resolves to `https://alloai.in`.

- [ ] **Step 9: Update Firebase Auth Authorized Domains**
  - Go to [Firebase Console](https://console.firebase.google.com) → Authentication → **Settings** → **Authorized domains**.
  - Add `alloai.in` and `www.alloai.in` to allowed authentication domains.

- [ ] **Step 10: Update Email Provider Links & From Address**
  - Update Resend / SMTP sender domain and reply-to email addresses (`notifications@alloai.in`, `support@alloai.in`).
  - Verify email link generation resolves to `https://alloai.in`.

- [ ] **Step 11: Update Razorpay Payment Webhooks & Return URLs**
  - Log into Razorpay Dashboard → **Settings** → **Webhooks**.
  - Update Webhook URL to `https://alloai.in/api/webhooks/razorpay`.

- [ ] **Step 12: Trigger Production Redeployment**
  - Redeploy project on Vercel to rebuild static metadata with the updated environment variables:
    ```bash
    git commit --allow-empty -m "chore: trigger deployment for custom domain alloai.in"
    git push origin main
    ```

- [ ] **Step 13: Full Regression & Production Verification**
  - Verify `https://alloai.in` loads cleanly.
  - Test Signup, Login, Password Reset, AI Form, AI Generation, Billing Checkout, and Logout.

- [ ] **Step 14: Monitor Observability & Logs**
  - Monitor Vercel Deployment Logs, Firebase Auth logs, and Razorpay Webhook delivery reports for 24 hours.

---

*Document prepared for future domain migration.*
