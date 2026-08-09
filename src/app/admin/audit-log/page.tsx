"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminAuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/audit-log", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setLogs(json.data.logs || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Admin Audit Log</h1>
        <p className="text-slate-400">Security audit trail of all privileged administrative actions.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="border-b border-slate-800 py-4">
          <CardTitle className="text-lg flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-indigo-400" /> Action Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : logs.length > 0 ? (
            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Admin</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {item.timestamp ? format(new Date(item.timestamp), "MMM d, yyyy HH:mm:ss") : "Recent"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">{item.adminEmail}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                          {item.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">{item.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p>No audit log events recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
