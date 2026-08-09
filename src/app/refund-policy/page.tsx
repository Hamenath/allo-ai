import { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/config/legal";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | ALLO",
  description: "Subscription cancellation and refund policy for ALLO AI workspace plans.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white">Refund & Cancellation Policy</h1>
          </div>
          <p className="text-sm text-slate-400">
            Last Updated: {LEGAL_CONFIG.lastUpdated} | Version {LEGAL_CONFIG.refundVersion}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Free Plan</h2>
            <p>
              ALLO offers a FREE tier with 5 monthly AI generations so users can evaluate the platform before subscribing to a paid plan. No credit card is required for the Free plan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Subscription Cancellation</h2>
            <p>
              You may cancel your paid subscription (Pro or Business) at any time through the Billing page (`/billing`). Upon cancellation, your subscription will remain active until the end of your current billing period. No further charges will be made to your payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Refund Requests</h2>
            <p>
              Subscriptions are generally non-refundable once activated, as AI infrastructure costs are incurred upon quota allocation. However, if you experience technical billing errors or duplicate charges, please contact <span className="font-semibold text-indigo-400">{LEGAL_CONFIG.supportEmail}</span> within 7 days of the charge date for review.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
