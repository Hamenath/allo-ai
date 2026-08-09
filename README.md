<div align="center">
  # ALLO — All-in-One AI Workspace 🚀
  
  **Everything you need. One place.**
  
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn/ui-black?style=for-the-badge&logo=shadcnui" alt="shadcn/ui" /></a>
    <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Auth_&_Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Gemini" /></a>
  </p>
</div>

<br/>

## 🌟 What is ALLO?

**ALLO** is an all-in-one, production-grade AI workspace SaaS platform designed to eliminate tool fatigue. Instead of paying for 15 different disjointed apps for distinct micro-tasks, ALLO brings practical AI tools together in a single, coherent, premium interface.

Whether you are optimizing your career, analyzing a startup, writing code, or studying for an exam, ALLO provides highly-tailored tools powered by the state-of-the-art **Google Gemini 2.5 Flash** model.

## 🛠️ Features (Current Capabilities)

### Career AI Suite
- **📄 Resume Analyzer**: Get ATS scores, actionable feedback, and detailed improvement plans tailored to your specific target job.
- **💼 Interview Generator**: Practice with dynamic, tailored interview questions categorized by difficulty and type (Technical, HR, Behavioral).
- **✉️ Cold Email Generator**: Write high-converting, personalized cold outreach emails with variable lengths and follow-up templates.
- **📝 Cover Letter Generator**: Instantly generate persuasive cover letters that perfectly align your existing resume with your target job description.
- **💡 LinkedIn Post Generator**: Craft viral and professional updates to share your achievements, thoughts, or startup news.
- **🎓 Study Planner**: Auto-generate a comprehensive study strategy, daily routine, topic breakdown, and milestone checklist to ace your next exam or certification.

### 🧠 Core Architecture
- **Unified AI Engine**: A robust backend provider utilizing Google Gemini's structured JSON schema generation.
- **Tool Registry System**: Easily plug-and-play new AI tools by defining a single `Zod` schema and system prompt. 
- **Favorites & History**: Fully integrated with Firebase Firestore to persist generation histories, allowing you to seamlessly revisit and favorite previous AI outputs.
- **Secure Authentication**: Firebase Auth guards routes using a Higher-Order Component and validates API calls securely via Firebase Admin SDK.

<br/>

## 📸 Sneak Peek

<br/>

## 🚀 Getting Started

Follow these steps to run the ALLO workspace locally.

### 1. Prerequisites
- **Node.js** v18+
- **npm** or **pnpm** or **yarn**
- A **Firebase** Project (Auth + Firestore)
- A **Google Gemini** API Key

### 2. Clone the Repository
```bash
git clone https://github.com/Hamenath/allo-ai.git
cd allo-ai
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Environment Configuration
Create a `.env.local` file in the root directory by copying the example file:
```bash
cp .env.example .env.local
```
Fill in the following variables with your own credentials:
```env
# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"

# Firebase Admin (Private / Server-side)
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<br/>

## 🏗️ Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI Models**: Google Gemini (`gemini-2.5-flash`) + `@google/genai`
- **Validation**: Zod + React Hook Form

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).

<p align="center">Built with 💜 by the ALLO Team.</p>
