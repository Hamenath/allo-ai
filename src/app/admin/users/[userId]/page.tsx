"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Calendar, Sparkles, CreditCard, Shield, ShieldOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminUserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadUserDetail() {
      if (!currentUser || !userId) return;
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load user detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserDetail();
  }, [currentUser, userId]);

  const handleToggleStatus = async () => {
    if (!currentUser || !data?.user) return;
    const currentDisabled = data.user.disabled;
    const actionName = currentDisabled ? "enable" : "disable";
    if (!confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    setUpdating(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disabled: !currentDisabled }),
      });
      const json = await res.json();
      if (json.success) {
        setData({
          ...data,
          user: { ...data.user, disabled: !currentDisabled },
        });
      } else {
        alert(json.error?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const u = data?.user;
  const sub = data?.subscription;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/users" className="text-slate-400 hover:text-white mb-4 flex items-center text-sm transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users List
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">{u?.name || "User Details"}</h1>
            <p className="text-slate-400">{u?.email}</p>
          </div>
          <Button 
            variant={u?.disabled ? "default" : "outline"}
            onClick={handleToggleStatus}
            disabled={updating}
            className={u?.disabled ? "bg-emerald-600 hover:bg-emerald-700" : "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"}
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : u?.disabled ? (
              <><Shield className="mr-2 h-4 w-4" /> Enable Account</>
            ) : (
              <><ShieldOff className="mr-2 h-4 w-4" /> Disable Account</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-base flex items-center">
              <User className="mr-2 h-4 w-4 text-indigo-400" /> Account Specs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">User ID</span>
              <code className="text-xs text-indigo-300 bg-slate-950 px-2 py-0.5 rounded">{u?.id}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role</span>
              <Badge variant="secondary">{u?.role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Status</span>
              <Badge variant={u?.disabled ? "destructive" : "secondary"}>
                {u?.disabled ? "Disabled" : "Active"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registered</span>
              <span>{u?.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-base flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-emerald-400" /> Plan & Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Plan</span>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-300">{u?.plan}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Generations</span>
              <span className="font-bold text-amber-400">{data?.generationCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Subscription Status</span>
              <span>{sub?.status || u?.subscriptionStatus || "Active"}</span>
            </div>
            {sub?.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-slate-400">Period End</span>
                <span>{format(new Date(sub.currentPeriodEnd), "MMM d, yyyy")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
