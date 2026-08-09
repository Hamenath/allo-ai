"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Wand2, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  Activity, 
  ShieldAlert, 
  ArrowLeft, 
  LogOut, 
  Menu,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const adminSidebarLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Management", isHeader: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "AI Usage", href: "/admin/usage", icon: Sparkles },
  { name: "Tools", href: "/admin/tools", icon: Wand2 },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Payments", href: "/admin/payments", icon: Receipt },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "System & Health", isHeader: true },
  { name: "System Health", href: "/admin/system", icon: Activity },
  { name: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert },
];

const AdminSidebarContent = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-950 text-slate-100 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <span className="font-mono text-xl font-bold tracking-tight text-white">ALLO <span className="text-xs text-indigo-400 font-sans uppercase">Admin</span></span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-1 pb-4">
          {adminSidebarLinks.map((link, idx) => {
            if (link.isHeader) {
              return (
                <div key={idx} className="mt-5 mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {link.name}
                </div>
              );
            }

            const Icon = link.icon!;
            const isActive = pathname === link.href;

            return (
              <Link key={idx} href={link.href || "#"}>
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all ${isActive ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"}`}>
                  <Icon className="h-4 w-4" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <div className="mt-auto border-t border-slate-800 p-4 space-y-3">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="w-full justify-start border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to ALLO
          </Button>
        </Link>
        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-8 w-8 shrink-0 bg-indigo-950 border border-indigo-800">
              <AvatarFallback className="text-indigo-300 font-bold text-xs">{user?.email?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium leading-none text-white truncate">{user?.displayName || "Admin User"}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-white hover:bg-slate-900" onClick={logout} title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminAuth() {
      if (authLoading) return;
      if (!user) {
        setIsAdminAuthorized(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 403 || res.status === 401) {
          setIsAdminAuthorized(false);
        } else {
          setIsAdminAuthorized(true);
        }
      } catch (err) {
        console.error("Admin layout verification error:", err);
        setIsAdminAuthorized(false);
      }
    }

    checkAdminAuth();
  }, [user, authLoading]);

  if (authLoading || isAdminAuthorized === null) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isAdminAuthorized === false) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-white shadow-xl">
          <CardHeader className="text-center pb-2">
            <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-2" />
            <CardTitle className="text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-slate-400">
              Your account (<code>{user?.email || "Guest"}</code>) does not have administrative privileges to access the ALLO Control Panel.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Return to User Workspace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 md:flex fixed inset-y-0 z-30">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 text-slate-300">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Admin Navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 border-slate-800 bg-slate-950">
                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Admin management functions.</SheetDescription>
                <AdminSidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-mono text-lg font-bold tracking-tight text-white">ALLO <span className="text-xs text-indigo-400 font-sans">ADMIN</span></span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
