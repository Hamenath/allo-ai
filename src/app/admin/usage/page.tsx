"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toolsRegistry } from "@/lib/ai/registry";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, BarChart2 } from "lucide-react";

export default function AdminUsagePage() {
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
        console.error("Usage analytics error:", err);
      }
    }
    loadData();
  }, [user]);

  const toolsList = Object.values(toolsRegistry);
  const categories = Array.from(new Set(toolsList.map((t) => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Usage Analytics</h1>
        <p className="text-slate-400">Generation volume across tools, categories, and plans.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{stats?.totalGenerations ?? 0}</div>
            <p className="text-xs text-slate-500 mt-1">Platform total</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Registered Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-400">{toolsList.length}</div>
            <p className="text-xs text-slate-500 mt-1">Available in registry</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{categories.length}</div>
            <p className="text-xs text-slate-500 mt-1">Career, Business, Dev, Learning, Productivity</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart2 className="mr-2 h-5 w-5 text-indigo-400" /> Categories Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const catTools = toolsList.filter((t) => t.category === cat);
              return (
                <div key={cat} className="p-4 rounded-xl border border-slate-800 bg-slate-950">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white">{cat}</span>
                    <Badge variant="secondary">{catTools.length} tools</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {catTools.map((t) => t.name).slice(0, 2).join(", ")}
                    {catTools.length > 2 && "..."}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
