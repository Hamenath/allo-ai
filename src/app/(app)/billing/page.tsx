"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserPlan } from "@/lib/db/usage";
import { PLANS, PlanType } from "@/lib/billing/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("FREE");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      if (!user) return;
      try {
        const plan = await getUserPlan(user.uid);
        setCurrentPlan(plan);
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [user]);

  const planList = Object.values(PLANS);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-4">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
          Flexible Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, Transparent Plans</h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Choose the plan that fits your personal workflow, business, or dev stack.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {planList.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isRecommended = plan.recommended;

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
                  disabled={isCurrent}
                  onClick={() => {
                    alert(`Subscription payments will be enabled in Phase 10! Current selected plan: ${plan.name}`);
                  }}
                >
                  {isCurrent ? "Active Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ / Trust Banner */}
      <Card className="border-border/50 bg-muted/10 p-6 rounded-2xl text-center space-y-2 max-w-3xl mx-auto">
        <h3 className="font-semibold text-base flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> Fair & Transparent Usage
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Generations reset on the 1st of every month. Unused generations do not roll over. Non-AI operations such as browsing history, editing saved documents, and manual CRM entries never consume your monthly quota.
        </p>
      </Card>
    </div>
  );
}
