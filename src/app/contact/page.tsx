import { Metadata } from "next";
import { LEGAL_CONFIG } from "@/lib/config/legal";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact & Support | ALLO",
  description: "Get in touch with ALLO support, privacy, billing, and legal teams.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
          </div>
          <p className="text-sm text-slate-400">
            Have questions about your account, subscriptions, or privacy? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-indigo-400">
                <MessageSquare className="mr-2 h-5 w-5" /> Customer Support
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                General inquiries, workspace help, and technical support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{LEGAL_CONFIG.supportEmail}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-emerald-400">
                <CreditCard className="mr-2 h-5 w-5" /> Billing & Refunds
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Subscription questions, Razorpay invoices, and payment inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{LEGAL_CONFIG.supportEmail}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-amber-400">
                <Shield className="mr-2 h-5 w-5" /> Privacy & Data Requests
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Data export requests, account deletion inquiries, and privacy issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{LEGAL_CONFIG.privacyEmail}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-purple-400">
                <Mail className="mr-2 h-5 w-5" /> Legal & Terms
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Terms of service, legal notices, and compliance requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{LEGAL_CONFIG.legalEmail}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
