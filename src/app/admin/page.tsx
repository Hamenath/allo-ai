"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Sparkles, 
  CreditCard, 
  IndianRupee, 
  Wand2, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
            System Control Panel
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Real-time platform metrics, user management, and operational diagnostics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Registered Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Free: {stats?.freeUsers ?? 0} | Pro: {stats?.proUsers ?? 0} | Biz: {stats?.businessUsers ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">AI Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalGenerations ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Across all registered AI tools</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Paid Subs</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Verified active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Gross Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Operational gross revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" /> User Management
            </CardTitle>
            <CardDescription className="text-slate-400">Inspect user accounts, usage quotas, and account status controls.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/users">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Manage Users <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-indigo-400" /> AI Tools Directory
            </CardTitle>
            <CardDescription className="text-slate-400">View all {stats?.totalTools || 15} registered AI tools and category metrics.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/tools">
              <Button variant="outline" className="w-full border-slate-800 text-slate-200 hover:bg-slate-800">Explore Tools <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" /> System Diagnostics
            </CardTitle>
            <CardDescription className="text-slate-400">Monitor Firebase, Firestore, Gemini, and Razorpay configuration state.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Link href="/admin/system">
              <Button variant="outline" className="w-full border-slate-800 text-slate-200 hover:bg-slate-800">System Health <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Integration Diagnostics Card */}
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Key Provider Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Gemini AI Provider</p>
                <p className="text-sm font-medium text-white mt-0.5">{stats?.isGeminiConfigured ? "Configured ✓" : "Missing API Key ✗"}</p>
              </div>
              <Badge variant={stats?.isGeminiConfigured ? "secondary" : "destructive"}>
                {stats?.isGeminiConfigured ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Razorpay Billing Provider</p>
                <p className="text-sm font-medium text-white mt-0.5">{stats?.isRazorpayConfigured ? "Configured ✓" : "Sandbox / Missing Keys ✗"}</p>
              </div>
              <Badge variant={stats?.isRazorpayConfigured ? "secondary" : "outline"}>
                {stats?.isRazorpayConfigured ? "Active" : "Sandbox Mode"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
