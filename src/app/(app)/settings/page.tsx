"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsage, UsageInfo } from "@/lib/db/usage";
import { getPlanConfig } from "@/lib/billing/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, CreditCard, Sparkles, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsage() {
      if (!user) return;
      try {
        const info = await getUsage(user.uid);
        setUsage(info);
      } catch (err) {
        console.error("Failed to load settings usage", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, [user]);

  const planConfig = getPlanConfig(usage?.plan);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account profile, plan subscriptions, and preferences.</p>
      </div>

      {/* Account Info Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 flex-1">
              <p className="text-lg font-bold">{user?.displayName || "ALLO User"}</p>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                User ID: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{user?.uid}</code>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="text-destructive hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan & Usage Summary Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-primary" /> Plan & Subscription
            </CardTitle>
            <Badge variant="secondary" className="px-3 py-1 font-semibold">
              {planConfig.name} Plan
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-xl bg-muted/30 border">
            <div>
              <p className="text-sm font-semibold text-foreground">Current Active Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">{planConfig.description}</p>
            </div>
            <Link href="/billing">
              <Button variant="default" size="sm">
                Manage Plan & Billing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Monthly AI Usage</span>
              <span>{loading ? "..." : `${usage?.used} / ${usage?.limit} generations`}</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${usage?.percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>{usage?.remaining} remaining</span>
              <Link href="/usage" className="text-primary hover:underline font-medium">
                View detailed usage history →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
