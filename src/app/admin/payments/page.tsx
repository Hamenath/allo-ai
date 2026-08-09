"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, IndianRupee } from "lucide-react";

export default function AdminPaymentsPage() {
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
        console.error("Failed to load payment stats:", err);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Payment & Revenue Analytics</h1>
        <p className="text-slate-400">Operational gross revenue and payment transaction logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Gross Operational Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">₹{stats?.totalRevenue ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Verified payments</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Paid Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-400">{stats?.activeSubscriptions ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Paid recurring tiers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
