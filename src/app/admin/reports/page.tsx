"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, Sparkles, CreditCard, ShieldCheck } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Operational Reports</h1>
        <p className="text-slate-400">High-level platform growth, usage distribution, and capacity insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-indigo-400" /> User Distribution Summary
            </CardTitle>
            <CardDescription className="text-slate-400">Overview of account specifications and subscription tier allocation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Default Allocation</span>
              <span>Free Plan (5 generations/mo)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Paid Tier Adoption</span>
              <span>Pro (₹299/mo) & Business (₹799/mo)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-amber-400" /> Platform Throughput
            </CardTitle>
            <CardDescription className="text-slate-400">Generation volume & security pipeline health.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Generation Engine</span>
              <span>Gemini 1.5 Flash (Structured Outputs)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Concurrency Guard</span>
              <span>Firestore Period Document Locks</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
