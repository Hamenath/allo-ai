<div align="center">
  <h1>ALLO — All-in-One AI Workspace 🚀</h1>
  
  **Everything you need. One place.**
  
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn/ui-black?style=for-the-badge&logo=shadcnui" alt="shadcn/ui" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini" /></a>
  </p>
</div>

<br/>

## 🌟 What is ALLO?

**ALLO** is an all-in-one, production-grade AI workspace SaaS platform designed to eliminate tool fatigue. Instead of paying for 15 different disjointed apps for distinct micro-tasks, ALLO brings practical AI tools together in a single, coherent, premium interface.

Target Production Domain: **[https://alloai.in](https://alloai.in)**

---

## 🛠️ Features & Tool Suites

### Career & Productivity Suite
- **📄 Resume Analyzer**: Get ATS scores, actionable feedback, and detailed improvement plans tailored to your target job.
- **💼 Interview Generator**: Practice with dynamic, tailored interview questions categorized by difficulty and type (Technical, HR, Behavioral).
- **✉️ Cold Email Generator**: Write high-converting, personalized cold outreach emails with variable lengths and follow-up templates.
- **📝 Cover Letter Generator**: Instantly generate persuasive cover letters aligning your resume with target job descriptions.
- **💡 LinkedIn Post Generator**: Craft viral and professional updates to share your achievements, thoughts, or startup news.
- **🎓 Study Planner**: Auto-generate a comprehensive study strategy, daily routine, topic breakdown, and milestone checklist.

### Business & Developer Suite
- **🚀 Startup Validator**: Analyze business ideas, market sizing, target demographics, and risk factors.
- **📋 Proposal Generator**: Generate professional business and project proposals.
- **📑 Invoice Generator**: Format line-item invoice documents for clients and business deals.
- **🐛 Bug Report Generator**: Format structured developer bug reports and reproduction steps.
- **📖 README Generator**: Generate GitHub repository documentation and installation guides.
- **🤝 CRM Lead Tools**: Manage client relationships, leads, and outreach logs.

---

## 🏗️ Architecture Highlights
- **Unified AI Engine**: Backend provider utilizing Google Gemini's structured JSON schema generation (`@google/genai`).
- **Monetization & Billing**: Razorpay Subscription webhook processing (`PRO` & `BUSINESS` tiers).
- **Security & Authorization**: Server-authoritative custom claims, sliding window rate-limiting, and `firestore.rules` owner isolation.
- **Automated Testing**: Vitest suite covering unit, security threat fencing, and rate-limiting concurrency.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20.x
- **npm** v10+
- A **Firebase** Project (Auth + Firestore)
- A **Google Gemini** API Key

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/Hamenath/allo-ai.git
cd allo-ai

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
```

### 3. Run Development Server & Automated Tests
```bash
# Run local development server
npm run dev

# Run automated Vitest test suite
npm test

# Run TypeScript type check
npx tsc --noEmit
```

---

## 📜 Documentation References
- [Environment Specification](docs/environment.md)
- [Database & Firestore Spec](docs/database.md)
- [Production Deployment Guide](docs/deployment.md)
- [Disaster Recovery & Secret Rotation](docs/disaster-recovery.md)
- [Production Operations Runbook](docs/production-runbook.md)
- [Production Readiness Matrix](docs/production-readiness.md)

---

<p align="center">Built with 💜 by the ALLO Team.</p>
