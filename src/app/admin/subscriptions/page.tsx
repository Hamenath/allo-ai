"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error("Failed to load subscription stats:", err);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Subscription Analytics</h1>
        <p className="text-slate-400">Aggregate subscription metrics and active plan distributions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Free Tier Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-200">{stats?.freeUsers ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">₹0/mo (5 AI generations)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Pro Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-400">{stats?.proUsers ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">₹299/mo (100 AI generations)</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Business Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats?.businessUsers ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">₹799/mo (500 AI generations)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
