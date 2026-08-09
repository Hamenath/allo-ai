"use client";

import { useState } from "react";
import { toolsRegistry } from "@/lib/ai/registry";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wand2, Search } from "lucide-react";

export default function AdminToolsPage() {
  const [search, setSearch] = useState("");
  const toolsList = Object.values(toolsRegistry);

  const filteredTools = toolsList.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tool Management</h1>
        <p className="text-slate-400">View all registered AI tools, routes, and required plan specification levels.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        <Input 
          type="search" 
          placeholder="Filter tools by name, category, or ID..." 
          className="pl-10 bg-slate-900 border-slate-800 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Tool Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Required Plan</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTools.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {t.name}
                      <p className="text-xs font-mono text-slate-500 font-normal">{t.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      /tools/{t.id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">
                        {t.planRequirement || "FREE"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
