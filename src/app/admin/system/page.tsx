"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldCheck, Database, Key, CreditCard } from "lucide-react";

export default function AdminSystemPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealth() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/system", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setHealth(json.data);
      } catch (err) {
        console.error("System health error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHealth();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">System Health & Security</h1>
        <p className="text-slate-400">Environment status, database connections, and provider readiness (secrets masked).</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="mr-2 h-5 w-5 text-indigo-400" /> Operational Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-sm">Application Status</p>
                  <p className="text-xs text-slate-400">{health?.nodeEnv} environment</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {health?.applicationStatus}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-semibold text-sm">Firestore Database</p>
                  <p className="text-xs text-slate-400">Canonical data store</p>
                </div>
              </div>
              <Badge variant="outline">{health?.firestore}</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="font-semibold text-sm">Gemini AI Provider</p>
                  <p className="text-xs text-slate-400">Structured Output Engine</p>
                </div>
              </div>
              <Badge variant="outline">{health?.geminiAi}</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-sm">Razorpay Billing</p>
                  <p className="text-xs text-slate-400">Monetization Engine</p>
                </div>
              </div>
              <Badge variant="outline">{health?.razorpayBilling}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
