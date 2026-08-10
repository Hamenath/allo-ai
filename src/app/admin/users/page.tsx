"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Shield, ShieldOff, Eye, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadUsers() {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setFetchError("Authentication required to view users.");
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (planFilter !== "ALL") params.set("plan", planFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users || []);
      } else {
        setFetchError(json.error?.message || "Failed to load user list");
      }
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setFetchError(err.message || "Network error fetching users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, searchTerm, planFilter]);

  const handleToggleStatus = async (targetUserId: string, currentDisabled: boolean) => {
    if (!user) return;
    const actionName = currentDisabled ? "enable" : "disable";
    if (!confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    setUpdatingId(targetUserId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/users/${targetUserId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disabled: !currentDisabled }),
      });
      const json = await res.json();
      if (json.success) {
        loadUsers();
      } else {
        alert(json.error?.message || "Failed to update user status");
      }
    } catch (err) {
      console.error("Toggle user error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">User Management</h1>
        <p className="text-slate-400">Search, filter, and inspect user accounts across all plans.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <Input 
            type="search" 
            placeholder="Search by name or email..." 
            className="pl-10 bg-slate-900 border-slate-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-800 text-white">
            <SelectValue placeholder="Filter by Plan" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800 text-white">
            <SelectItem value="ALL">All Plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PRO">Pro</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-0">
          {loading || authLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : fetchError ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
              <p className="text-rose-400 font-medium mb-1">{fetchError}</p>
              <Button variant="outline" size="sm" onClick={loadUsers} className="mt-3 border-slate-800">
                Retry Loading
              </Button>
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">
                          {u.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.disabled ? "destructive" : "secondary"} className={u.disabled ? "" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}>
                          {u.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link href={`/admin/users/${u.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-300 hover:text-white">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={updatingId === u.id}
                          onClick={() => handleToggleStatus(u.id, u.disabled)}
                          className={`h-8 px-2 ${u.disabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'}`}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : u.disabled ? (
                            <><Shield className="h-4 w-4 mr-1" /> Enable</>
                          ) : (
                            <><ShieldOff className="h-4 w-4 mr-1" /> Disable</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p>No users found matching your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
