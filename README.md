<div align="center">
  <h1>ALLO — All Your AI Tools. One Simple Workspace.</h1>

  <p>
    <strong>Production AI SaaS platform for India — powered by Google Gemini.</strong>
  </p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini AI" /></a>
    <a href="https://razorpay.com/"><img src="https://img.shields.io/badge/Razorpay-Billing-3395FF?style=for-the-badge&logo=razorpay" alt="Razorpay" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" /></a>
  </p>

  <p>
    <a href="https://alloai.in">🌐 alloai.in</a> &nbsp;|&nbsp;
    <a href="docs/deployment.md">📦 Deploy</a> &nbsp;|&nbsp;
    <a href="docs/security-audit.md">🔐 Security</a> &nbsp;|&nbsp;
    <a href="CHANGELOG.md">📝 Changelog</a>
  </p>
</div>

---

## What is ALLO?

**ALLO** is a production-grade AI SaaS workspace that brings 15+ practical AI tools into one clean interface. Instead of juggling separate subscriptions for writing, career, business, and developer tools, professionals get everything in one place.

**Target users:** Freelancers, job seekers, startup founders, developers, and business professionals in India.

**Live at:** [https://alloai.in](https://alloai.in)

---

## Tool Suite

### Career & Productivity
| Tool | Description |
|------|-------------|
| Resume Analyzer | ATS score, feedback, and improvement plan for your target role |
| Cover Letter Generator | Persuasive cover letters aligned with job descriptions |
| Interview Question Generator | Dynamic practice questions by type (Technical, HR, Behavioral) |
| Cold Email Generator | High-converting personalized outreach emails |
| LinkedIn Post Generator | Professional and viral content for your network |
| Study Planner | Comprehensive study strategy, schedule, and milestone tracker |
| Meeting Summarizer | Structured summaries, decisions, and action items from notes |

### Business & Developer
| Tool | Description |
|------|-------------|
| Startup Validator | Market sizing, target audience, and risk analysis for business ideas |
| Proposal Generator | Professional project and business proposals |
| Job Description Generator | Role-specific JDs with requirements and responsibilities |
| Social Media Calendar | Planned content across platforms |
| Bug Report Generator | Structured developer bug reports with reproduction steps |
| GitHub README Generator | Repository documentation and installation guides |
| Freelancer CRM | Client relationship and outreach management |
| Invoice Generator | Professional line-item invoices |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI |
| AI | Google Gemini (`@google/genai`) — structured JSON output |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Cloud Firestore (security rules enforced) |
| Storage | Firebase Storage (owner-isolated) |
| Billing | Razorpay (INR, orders + webhook verification) |
| Email | Resend (transactional) |
| Rate Limiting | Upstash Redis (sliding window) |
| Hosting | Vercel (Edge Network) |
| Testing | Vitest |
| Language | TypeScript 5 |

---

## Project Structure

```
allo-ai/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (app)/              # Authenticated app pages (dashboard, tools, billing…)
│   │   ├── api/                # Server-side API routes
│   │   │   ├── ai/generate/    # Core AI generation endpoint
│   │   │   ├── admin/          # Admin-only endpoints
│   │   │   ├── billing/        # Razorpay integration endpoints
│   │   │   └── webhooks/       # Razorpay webhook handler
│   │   └── (public)/           # Marketing, legal, auth pages
│   ├── components/             # Reusable UI components
│   ├── context/                # React context providers (AuthContext)
│   └── lib/
│       ├── ai/                 # Gemini integration, tool registry, schemas
│       ├── admin/              # Admin auth verification, audit logging
│       ├── billing/            # Razorpay client, plan configuration
│       ├── config/             # Environment validation, legal config
│       ├── db/                 # Firestore data access (users, usage, subscriptions…)
│       ├── email/              # Transactional email provider + templates
│       └── security/           # Rate limiting, concurrency guards
├── tests/
│   ├── unit/                   # Unit tests (plans, registry, rate-limit, errors)
│   └── security/               # Security-focused auth tests
├── docs/                       # Architecture, deployment, and operations docs
├── public/                     # Static assets
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── storage.rules               # Firebase Storage security rules
├── .env.example                # Environment variable template
└── .github/workflows/ci.yml    # CI/CD pipeline
```

---

## Local Development

### Prerequisites

- **Node.js** v20.x or later
- **npm** v10+
- Firebase project (Auth + Firestore enabled)
- Google Gemini API key
- Razorpay account (optional for billing)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Hamenath/allo-ai.git
cd allo-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values. See [`docs/environment.md`](docs/environment.md) for a detailed description of each variable.

**Required for local development:**
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client configuration
- `FIREBASE_ADMIN_*` — Firebase Admin SDK credentials
- `GEMINI_API_KEY` — Google Gemini API key

**Required for billing:**
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

### Run

```bash
# Start development server (http://localhost:3000)
npm run dev

# Run type checking
npx tsc --noEmit

# Run linter
npm run lint

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run security tests only
npm run test:security
```

---

## Production Build

```bash
npm run build
npm start
```

---

## Testing

Tests live in `tests/` and use [Vitest](https://vitest.dev/).

```bash
npm test               # All tests
npm run test:unit      # Unit tests (plans, registry, rate-limit, errors)
npm run test:security  # Security tests (auth flows)
```

CI runs all tests automatically on every push to `main` and `develop`, and on every pull request.

---

## Deployment

ALLO is deployed to Vercel. See [`docs/deployment.md`](docs/deployment.md) for the full deployment guide.

**Quick summary:**
1. Set all environment variables in Vercel project settings
2. Deploy Firestore and Storage rules: `firebase deploy --only firestore:rules,storage:rules`
3. Configure Razorpay webhook URL: `https://alloai.in/api/webhooks/razorpay`
4. Push to `main` — CI/CD handles the rest

---

## Pricing Plans

| Plan | Monthly Generations | Price |
|------|-------------------|-------|
| Free | 10 | ₹0 |
| Pro | 500 | ₹999/mo |
| Business | Unlimited | ₹2,499/mo |

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/environment.md`](docs/environment.md) | All environment variables explained |
| [`docs/database.md`](docs/database.md) | Firestore data model and security rules |
| [`docs/deployment.md`](docs/deployment.md) | Production deployment guide |
| [`docs/production-runbook.md`](docs/production-runbook.md) | Operational runbook |
| [`docs/security-audit.md`](docs/security-audit.md) | Phase 27 security audit findings and fixes |
| [`docs/incident-response.md`](docs/incident-response.md) | Incident response and secret rotation runbook |
| [`docs/product-review.md`](docs/product-review.md) | Business readiness review |
| [`docs/product-debt.md`](docs/product-debt.md) | Known technical and UX debt register |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |
| [`SECURITY.md`](SECURITY.md) | Security policy and vulnerability reporting |

---

## Security

ALLO uses server-side authorization for all protected resources. Key controls:

- **Authentication:** Firebase Auth JWT tokens verified server-side on every API call
- **Authorization:** Firestore security rules enforce owner-isolation; no cross-user data access
- **Billing:** Razorpay HMAC signature verification on all webhooks; idempotency enforced
- **AI Safety:** Prompt injection guards, Zod input validation, structured output only
- **Rate Limiting:** Sliding window limits on AI, billing, and admin endpoints

To report a security vulnerability, see [`SECURITY.md`](SECURITY.md).

---

## License

Proprietary — All rights reserved. © 2026 ALLO AI.

---

<p align="center">Built with 💜 for professionals across India.</p>
