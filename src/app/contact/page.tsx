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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO Home
        </Link>

        <div className="border-b pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-extrabold">Contact &amp; Support</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Have questions about your account, subscriptions, or privacy? We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" /> Customer Support
              </CardTitle>
              <CardDescription>
                General inquiries, workspace help, and technical support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{LEGAL_CONFIG.supportEmail}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" /> Billing &amp; Refunds
              </CardTitle>
              <CardDescription>
                Subscription questions, Razorpay invoices, and payment inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{LEGAL_CONFIG.supportEmail}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" /> Privacy &amp; Data Requests
              </CardTitle>
              <CardDescription>
                Data export requests, account deletion inquiries, and privacy issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{LEGAL_CONFIG.privacyEmail}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Mail className="mr-2 h-5 w-5 text-primary" /> Legal &amp; Terms
              </CardTitle>
              <CardDescription>
                Terms of service, legal notices, and compliance requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{LEGAL_CONFIG.legalEmail}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
