import { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/config/legal";
import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | ALLO",
  description: "Explanation of essential cookies used by the ALLO AI workspace.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white">Cookie Policy</h1>
          </div>
          <p className="text-sm text-slate-400">
            Last Updated: {LEGAL_CONFIG.lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Essential Cookies Only</h2>
            <p>
              {LEGAL_CONFIG.appName} uses strictly essential authentication and session cookies. These cookies are required to authenticate your user session ({LEGAL_CONFIG.providers.authentication}) and remember your dark/light theme preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Third-Party Tracking & Advertising</h2>
            <p>
              ALLO does NOT use non-essential third-party advertising or cross-site tracking cookies. We do not sell user data to advertising networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Managing Cookie Preferences</h2>
            <p>
              You may clear cookies through your browser settings at any time. Note that clearing essential authentication cookies will log you out of your ALLO workspace session.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
