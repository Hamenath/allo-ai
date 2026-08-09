# ALLO — Disaster Recovery & Secret Rotation Specification

This document details disaster recovery procedures, database backup policies, and secret rotation steps for **ALLO**.

---

## 1. Database Backup & Recovery Procedure
- **Automated Backups**: Google Cloud Firestore Point-in-Time Recovery (PITR) & daily automated exports enabled in the Google Cloud Console.
- **Recovery SLA**: RPO < 24 hours, RTO < 2 hours.
- **Recovery Execution**:
  ```bash
  gcloud firestore import gs://allo-backup-bucket/latest --async
  ```

---

## 2. Secret Rotation Playbook

### 2.1 Gemini API Key Rotation
1. Generate new API key in Google AI Studio.
2. Update `GEMINI_API_KEY` in Vercel production environment variables.
3. Trigger instant redeployment.
4. Revoke old API key in Google AI Studio.

### 2.2 Razorpay Webhook Secret Rotation
1. Update Webhook Secret in Razorpay Dashboard (`https://dashboard.razorpay.com`).
2. Update `RAZORPAY_WEBHOOK_SECRET` in production environment variables.
3. Redeploy application.

### 2.3 Firebase Admin Service Account Rotation
1. Generate new Private Key in Firebase Console (`Project Settings -> Service Accounts`).
2. Replace `FIREBASE_ADMIN_PRIVATE_KEY` in production environment variables.
3. Delete legacy service key from Firebase Console.
