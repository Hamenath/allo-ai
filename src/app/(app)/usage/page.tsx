"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsage, UsageInfo } from "@/lib/db/usage";
import { getPlanConfig } from "@/lib/billing/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Calendar, Zap, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function UsagePage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsage() {
      if (!user) return;
      try {
        const info = await getUsage(user.uid);
        setUsage(info);
      } catch (err) {
        console.error("Failed to load usage", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = getPlanConfig(usage?.plan);
  const isLimitReached = (usage?.remaining || 0) <= 0;
  const isNearLimit = (usage?.percentage || 0) >= 80 && !isLimitReached;

  const resetDateString = usage?.resetAt 
    ? format(new Date(usage.resetAt), "MMMM d, yyyy")
    : "Next Month";

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Usage & Entitlements</h1>
        <p className="text-muted-foreground text-lg">Monitor your monthly AI generation quota and active plan features.</p>
      </div>

      {/* Limit Reached Banner */}
      {isLimitReached && (
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive text-base">Monthly AI Limit Reached</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                You&apos;ve used all {usage?.limit} AI generations included in your {currentPlan.name} plan for this billing cycle.
              </p>
            </div>
          </div>
          <Link href="/billing" className="shrink-0 w-full sm:w-auto">
            <Button variant="default" className="w-full">
              Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Near Limit Banner */}
      {isNearLimit && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium">You&apos;re almost at your monthly limit ({usage?.used} / {usage?.limit} used).</p>
          </div>
          <Link href="/billing">
            <Button variant="outline" size="sm">Upgrade Plan</Button>
          </Link>
        </div>
      )}

      {/* Main Usage Overview Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Monthly AI Quota</CardTitle>
                <CardDescription>Resets automatically on {resetDateString}</CardDescription>
              </div>
            </div>
            <Badge variant={usage?.plan === "FREE" ? "secondary" : "default"} className="px-3 py-1 text-sm font-medium">
              {currentPlan.name} Plan
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-foreground">Generations Used</span>
              <span className="font-semibold">{usage?.used} / {usage?.limit} ({usage?.percentage}%)</span>
            </div>
            <Progress value={usage?.percentage} className="h-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border bg-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Generations Used</p>
              <p className="text-2xl font-bold mt-1">{usage?.used}</p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Remaining Quota</p>
              <p className={`text-2xl font-bold mt-1 ${isLimitReached ? 'text-destructive' : 'text-emerald-500'}`}>
                {usage?.remaining}
              </p>
            </div>
            <div className="p-4 rounded-xl border bg-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next Reset</p>
              <p className="text-sm font-semibold mt-2 flex items-center">
                <Calendar className="mr-1.5 h-4 w-4 text-muted-foreground" />
                {resetDateString}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Non-AI operations (viewing, editing, exporting saved docs) are always unlimited.
          </p>
          <Link href="/billing">
            <Button variant="outline" size="sm">
              View All Plans
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Plan Specifications & Included Features */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Active Entitlements ({currentPlan.name})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPlan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-sm text-foreground">
                <CheckCircle2 className="mr-2.5 h-4 w-4 text-emerald-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
