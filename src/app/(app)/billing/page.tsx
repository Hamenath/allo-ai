"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserPlan } from "@/lib/db/usage";
import { getSubscription, SubscriptionRecord } from "@/lib/db/subscriptions";
import { PLANS, PlanType } from "@/lib/billing/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, Calendar, History, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("FREE");
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const plan = await getUserPlan(user.uid);
        setCurrentPlan(plan);

        const sub = await getSubscription(user.uid);
        setSubscription(sub);
      } catch (err) {
        console.error("Failed to load billing details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleUpgrade = async (planId: PlanType) => {
    if (!user) return;
    setProcessingPlan(planId);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      const json = await res.json();

      if (!json.success) {
        if (json.error?.code === "RAZORPAY_NOT_CONFIGURED") {
          setErrorMessage(
            "Razorpay API credentials are not set in environment variables. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local to test live payments."
          );
        } else {
          setErrorMessage(json.error?.message || "Failed to initialize payment.");
        }
        setProcessingPlan(null);
        return;
      }

      const { keyId, orderId, amount, currency } = json.data;

      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "ALLO AI Workspace",
          description: `${planId} Subscription Plan`,
          order_id: orderId,
          handler: async function (response: any) {
            // Server-side payment verification
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...response,
                plan: planId,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (verifyJson.success) {
              setCurrentPlan(planId);
              window.location.reload();
            } else {
              setErrorMessage("Payment verification failed: " + (verifyJson.error?.message || "Unknown error"));
            }
          },
          prefill: {
            email: user.email || "",
            name: user.displayName || "",
          },
          theme: {
            color: "#0f172a",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setErrorMessage("Razorpay Checkout script failed to load.");
      }
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setErrorMessage("An unexpected error occurred during upgrade.");
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.")) return;

    setCancelling(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        alert(json.data.message);
        window.location.reload();
      } else {
        setErrorMessage(json.error?.message || "Failed to cancel subscription.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setCancelling(false);
    }
  };

  const planList = Object.values(PLANS);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const periodEndString = subscription?.currentPeriodEnd
    ? format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")
    : null;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Plans & Billing</h1>
          <p className="text-muted-foreground text-lg">Manage your subscription, billing preferences, and payment history.</p>
        </div>
        <Link href="/billing/history">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" /> Payment History
          </Button>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3 text-destructive text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Active Subscription Status Banner */}
      {currentPlan !== "FREE" && (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold">
                  {currentPlan} Active
                </Badge>
                {subscription?.cancelAtPeriodEnd && (
                  <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                    Cancels at period end
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground pt-1">
                Your {currentPlan} subscription is currently active.
              </p>
              {periodEndString && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {subscription?.cancelAtPeriodEnd ? "Access expires on" : "Renews on"} {periodEndString}
                </p>
              )}
            </div>

            {!subscription?.cancelAtPeriodEnd && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Subscription"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-2">
        {planList.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isRecommended = plan.recommended;
          const isProcessing = processingPlan === plan.id;

          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col relative transition-all duration-200 ${
                isRecommended 
                  ? "border-primary shadow-lg ring-1 ring-primary/20 scale-[1.02] bg-card" 
                  : "border-border/60 hover:border-border shadow-sm"
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Recommended
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  {isCurrent && (
                    <Badge variant="secondary" className="font-medium text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs min-h-8">{plan.description}</CardDescription>
                <div className="pt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">₹{plan.price}</span>
                  <span className="text-muted-foreground text-sm font-medium">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="p-3 rounded-lg bg-muted/40 text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Monthly AI Quota</span>
                  <span className="text-primary font-bold">{plan.monthlyGenerations} generations</span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features included:</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start text-xs text-foreground gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t mt-auto">
                <Button 
                  variant={isCurrent ? "outline" : isRecommended ? "default" : "secondary"}
                  className="w-full" 
                  disabled={isCurrent || isProcessing}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : isCurrent ? (
                    "Active Plan"
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ & Trust Section */}
      <Card className="border-border/50 bg-muted/10 p-6 rounded-2xl text-center space-y-2 max-w-3xl mx-auto">
        <h3 className="font-semibold text-base flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> India-First Razorpay Integration
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Payments are securely processed via Razorpay. All transactions feature server-side HMAC signature verification. Cards and secrets are never stored on ALLO servers.
        </p>
      </Card>
    </div>
  );
}
