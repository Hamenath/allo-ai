# ALLO — Database Architecture & Firestore Specification

This document provides a comprehensive technical reference for the Firestore database architecture, security rules, collection schemas, indexing rules, source of truth designations, and retention policies across the **ALLO** platform.

---

## 1. Collection Inventory & Schema Specifications

### 1.1 `users/{userId}`
- **Purpose**: Stores user profile metadata and trusted server-managed account state.
- **Document ID**: Matches Firebase Authentication `uid`.
- **Ownership**: Private to the individual user (`request.auth.uid == userId`).
- **Fields**:
  - `uid` *(string)*: Unique User Identifier.
  - `email` *(string)*: User email address.
  - `displayName` *(string)*: Full display name.
  - `photoURL` *(string, optional)*: Avatar URL.
  - `role` *(string, trusted)*: `"USER"` | `"ADMIN"`. Client write **DENIED**.
  - `plan` *(string, trusted)*: `"FREE"` | `"PRO"` | `"BUSINESS"`. Client write **DENIED**.
  - `subscriptionStatus` *(string, trusted)*: `"inactive"` | `"active"` | `"past_due"` | `"cancelled"`. Client write **DENIED**.
  - `disabled` *(boolean, trusted)*: Account suspension state. Client write **DENIED**.
  - `createdAt` *(timestamp)*: Account creation timestamp.
  - `updatedAt` *(timestamp)*: Last profile update timestamp.
- **Security Rules**: Owner can read and create profile; client updates to trusted fields (`role`, `plan`, `subscriptionStatus`, `disabled`) are strictly **DENIED** by `firestore.rules`.

---

### 1.2 `aiGenerations/{docId}`
- **Purpose**: Primary repository for generated AI tool results, prompt inputs, and user favorites.
- **Document ID**: Auto-generated Firestore ID.
- **Ownership**: Private to document owner (`resource.data.userId == request.auth.uid`).
- **Fields**:
  - `userId` *(string)*: Owner User ID.
  - `toolId` *(string)*: Identifier of the AI tool (e.g. `"resume-analyzer"`, `"proposal"`).
  - `category` *(string)*: Tool category (e.g. `"CAREER"`, `"BUSINESS"`).
  - `title` *(string)*: Human-readable document title.
  - `input` *(map/object)*: Parsed Zod input parameters.
  - `output` *(map/object)*: Structured AI response object.
  - `isFavorite` *(boolean)*: User favorite bookmark state.
  - `createdAt` *(timestamp)*: Generation timestamp.
  - `updatedAt` *(timestamp)*: Modification timestamp.
- **Indexing & Queries**:
  - `userId ASC + createdAt DESC`
  - `userId ASC + isFavorite ASC + createdAt DESC`
  - `userId ASC + category ASC + createdAt DESC`
- **Pagination**: Cursor-based pagination (`startAfter(lastDoc)`, `limit(12)`).

---

### 1.3 `usage/{userId}`
- **Purpose**: Server-managed monthly usage counters and quota tracking.
- **Document ID**: Matches user `uid`.
- **Ownership**: Server-authoritative. Client `read` allowed if owner; client `write` **DENIED**.
- **Fields**:
  - `userId` *(string)*: Target User ID.
  - `used` *(number)*: Generations consumed in current billing period.
  - `limit` *(number)*: Maximum monthly generations allowed for current plan.
  - `remaining` *(number)*: Calculated remaining usage (`limit - used`).
  - `period` *(string)*: Current usage period identifier (e.g. `"2026-08"`).
  - `updatedAt` *(timestamp)*: Server timestamp of last usage increment.

---

### 1.4 `subscriptions/{userId}`
- **Purpose**: Server-managed Razorpay subscription lifecycle records.
- **Document ID**: Matches user `uid` or Razorpay subscription ID.
- **Ownership**: Client `read` allowed if owner; client `write` **DENIED**.
- **Fields**:
  - `userId` *(string)*: Subscribed User ID.
  - `subscriptionId` *(string)*: Razorpay Subscription ID (`sub_...`).
  - `planId` *(string)*: Active plan key (`"PRO"`, `"BUSINESS"`).
  - `status` *(string)*: `"active"` | `"created"` | `"cancelled"` | `"halted"`.
  - `currentPeriodEnd` *(timestamp)*: Next billing renewal date.
  - `createdAt` *(timestamp)*: Subscription creation timestamp.

---

### 1.5 `paymentHistory/{paymentId}`
- **Purpose**: Immutable ledger of payment receipts and Razorpay webhook events.
- **Document ID**: Razorpay Payment ID (`pay_...`).
- **Ownership**: Client `read` allowed if owner; client `write` **DENIED**.
- **Fields**:
  - `paymentId` *(string)*: Unique Razorpay Payment ID.
  - `userId` *(string)*: Paying User ID.
  - `amount` *(number)*: Amount paid in INR paise.
  - `currency` *(string)*: `"INR"`.
  - `status` *(string)*: `"captured"` | `"failed"`.
  - `createdAt` *(timestamp)*: Payment timestamp.

---

### 1.6 `notifications/{docId}`
- **Purpose**: In-app notifications for user activity, usage alerts, and billing events.
- **Document ID**: Auto-generated Firestore ID.
- **Ownership**: Private to recipient user (`resource.data.userId == request.auth.uid`).
- **Fields**:
  - `userId` *(string)*: Recipient User ID.
  - `type` *(string)*: `"welcome"` | `"usage_warning"` | `"usage_limit"` | `"payment_success"`.
  - `title` *(string)*: Notification title.
  - `message` *(string)*: Notification body text.
  - `read` *(boolean)*: Read status.
  - `createdAt` *(timestamp)*: Creation timestamp.
- **Security Rules**: Client update permitted **ONLY** on the `['read']` field.

---

### 1.7 Server-Only Audit & Webhook Collections (`auditLogs`, `processedWebhooks`)
- **`auditLogs`**: Append-only administrative security logs (Admin SDK write only, client read/write **DENIED**).
- **`processedWebhooks`**: Idempotency ledger for Razorpay webhook payloads (Admin SDK write only, client read/write **DENIED**).

---

## 2. Canonical Source of Truth Matrix

| Domain | Canonical Source of Truth |
| :--- | :--- |
| **User Identity** | Firebase Authentication (`request.auth.uid`, `request.auth.token.email`) |
| **User Role & Admin Permissions** | Firebase Custom Claims (`token.role == 'ADMIN'`) & `users/{userId}.role` |
| **Active Plan & Entitlements** | Server-verified `users/{userId}.plan` & Razorpay webhook state |
| **Monthly Usage Counts** | Server-managed `usage/{userId}` collection (Firebase Admin SDK) |
| **AI Tool Definitions** | Tool Registry (`src/lib/ai/registry.ts`) |
| **Pricing & Quotas** | Canonical Legal/Billing Config (`src/lib/config/legal.ts`, `src/lib/billing/plans.ts`) |

---

## 3. Indexing & Query Strategy

### Composite Indexes (`firestore.indexes.json`)
1. `aiGenerations`: `userId` ASC, `createdAt` DESC
2. `aiGenerations`: `userId` ASC, `isFavorite` ASC, `createdAt` DESC
3. `aiGenerations`: `userId` ASC, `category` ASC, `createdAt` DESC
4. `notifications`: `userId` ASC, `createdAt` DESC
5. `auditLogs`: `createdAt` DESC

### Unbounded Query Safeguards
- All query helpers in `src/lib/db/` enforce explicit `.limit()` caps.
- Dashboard quick widgets use `limitCount: 4`.
- Workspace paginated feeds use `pageSize: 12` with cursor-based `startAfter()`.
- Notification bell uses `limit(10)`.

---

## 4. Retention & Deletion Architecture

1. **User Account Deletion**:
   - Triggers clean-up of `aiGenerations`, `documents`, `favorites`, and `notifications`.
   - Payment history (`paymentHistory`) and invoice records are **retained for 7 years** to comply with Indian financial regulations.
2. **Webhooks & Temporary Processing Logs**:
   - Webhook idempotency records (`processedWebhooks`) automatically purge after 90 days.
