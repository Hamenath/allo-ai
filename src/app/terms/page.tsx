import { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/config/legal";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | ALLO",
  description: "Terms of Service governing use of the ALLO AI workspace platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
          </div>
          <p className="text-sm text-slate-400">
            Last Updated: {LEGAL_CONFIG.lastUpdated} | Version {LEGAL_CONFIG.termsVersion}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By creating an account or accessing {LEGAL_CONFIG.appName} at {LEGAL_CONFIG.websiteUrl}, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Acceptable Use & Prohibited Activity</h2>
            <p>You agree not to use ALLO for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Illegal activity, fraud, or generation of harmful content.</li>
              <li>Attempting to bypass monthly usage limits or rate-limiting guards.</li>
              <li>Unauthorized access, credential theft, or automated scraping.</li>
              <li>Submitting malicious software, malware, or destructive payloads.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. User Content & AI Outputs</h2>
            <p>
              You retain ownership of the content and materials you submit into ALLO. You are solely responsible for reviewing and verifying AI-generated outputs before relying on or distributing them. ALLO makes no warranty regarding the accuracy, completeness, or legal fitness of AI results.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Subscriptions & Payment Terms</h2>
            <p>
              Paid subscription plans (e.g. Pro, Business) are billed in Indian Rupees (INR) via Razorpay. Subscriptions renew automatically unless cancelled before the end of the current billing cycle. Access remains active until the end of your prepaid period upon cancellation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Contact Information</h2>
            <p>
              For legal inquiries or terms questions, please email us at: <span className="font-semibold text-indigo-400">{LEGAL_CONFIG.legalEmail}</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
