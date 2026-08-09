# Changelog

All notable changes to ALLO are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
ALLO uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

Changes staged for the next release will appear here.

---

## [1.0.0] — 2026-08-09

> **First production release of ALLO — All Your AI Tools. One Simple Workspace.**

### Added

#### Core Platform
- Next.js 16 App Router application with React 19 and TypeScript
- Firebase Authentication (email/password + Google OAuth)
- Cloud Firestore database with owner-isolated security rules
- Firebase Storage with per-user access control and 10MB upload limit
- Dark/light/system theme support via `next-themes`
- Responsive layout across desktop and mobile

#### AI Tool Suite
- **Resume Analyzer** — ATS score, keyword gap analysis, actionable improvement plan
- **Cover Letter Generator** — Tailored cover letters from resume + job description
- **Interview Question Generator** — Dynamic question sets by type and difficulty
- **Cold Email Generator** — Personalized outreach emails with follow-up templates
- **LinkedIn Post Generator** — Professional and viral content generation
- **Study Planner** — Full study strategy, schedule, and milestone tracker
- **Meeting Summarizer** — Structured summaries, decisions, and action items
- **Startup Validator** — Business idea analysis, market sizing, and risk assessment
- **Proposal Generator** — Professional project and business proposals
- **Job Description Generator** — Role-specific JDs with requirements
- **Social Media Calendar** — Multi-platform content planning
- **Bug Report Generator** — Structured developer bug reports
- **GitHub README Generator** — Repository documentation generator
- **Freelancer CRM** — Client relationship and outreach management utility
- **Invoice Generator** — Professional line-item invoice utility

#### AI Infrastructure
- Google Gemini (`@google/genai`) as the unified AI provider
- Zod-validated structured JSON output for all tools
- Server-side prompt injection guard on all AI requests
- Tool registry (`src/lib/ai/registry.ts`) as single source of truth for tool schemas
- Per-user monthly generation limits enforced server-side

#### Billing & Monetization
- Razorpay payment integration (INR)
- Three-tier pricing: Free (10/mo), Pro (₹999, 500/mo), Business (₹2,499, unlimited)
- Razorpay webhook processing with HMAC signature verification
- Webhook idempotency via `processedWebhooks` Firestore collection
- Subscription activation, cancellation, and payment history
- Billing history page with payment records

#### User Features
- Dashboard with tool discovery and quick access
- AI generation history with full input/output storage
- Favorites system for saved generations
- Document workspace for managing saved AI outputs
- Notification center with real-time usage alerts
- Usage meter with monthly quota tracking and visual indicator
- Account settings (profile, notifications, privacy)
- Data export and account deletion request flows

#### Admin Panel
- User management (list, search, filter by plan, disable/enable)
- Role management (grant/revoke admin)
- System health dashboard (Firebase, AI, Razorpay, Redis status)
- Usage analytics and revenue reporting
- Audit log for all admin actions

#### Security
- Server-side Firebase Auth JWT verification on all protected API routes
- Firestore security rules with default deny-all and owner isolation
- Trusted fields (`plan`, `role`, `subscriptionStatus`) blocked from client writes
- Razorpay webhook HMAC verification
- Sliding window rate limiting (AI: 10/min; billing: 5/min; admin: 60/min)
- Per-user AI concurrency guard (max 2 concurrent generations)
- 100KB server-side payload size cap on AI requests
- `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` security headers

#### Legal & Compliance
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)
- Refund Policy (`/refund-policy`)
- Cookie Policy (`/cookie-policy`)
- AI Disclaimer (`/ai-disclaimer`)

#### SEO & Performance
- Per-page metadata (`title`, `description`, Open Graph)
- `sitemap.xml` and `robots.txt` auto-generated
- JSON-LD Organization schema
- Web App Manifest (`/manifest.webmanifest`)

#### Developer Experience
- Vitest test suite (unit + security tests)
- GitHub Actions CI/CD pipeline (lint → typecheck → test → build)
- Environment variable validation at startup
- `.env.example` template with all required variables
- Comprehensive `docs/` directory

### Security Fixes (Phase 27)
- Restricted `updateUserProfile()` to a `SafeUserProfileUpdate` allowlist — prevents accidental trusted-field writes
- Added `Strict-Transport-Security` (HSTS 1 year) header
- Added `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` headers
- Added rate limiting (60 req/min) to the Razorpay webhook endpoint
- Documented all security-critical environment variables in `.env.example`

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | 2026-08-09 | First production release |

---

[Unreleased]: https://github.com/Hamenath/allo-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Hamenath/allo-ai/releases/tag/v1.0.0
