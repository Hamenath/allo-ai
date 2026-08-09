"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Code, 
  Sparkles,
  History,
  Heart,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Tools", href: "/tools", icon: Wand2, isHeader: true },
  { name: "Career", href: "/dashboard/career", icon: Briefcase },
  { name: "Business", href: "/dashboard/business", icon: FileText },
  { name: "Developer", href: "/dashboard/developer", icon: Code },
  { name: "Productivity", href: "/dashboard/productivity", icon: Sparkles },
  { name: "Your Space", href: "#", isHeader: true },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Favorites", href: "/dashboard/favorites", icon: Heart },
  { name: "Account", href: "#", isHeader: true },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

const SidebarContent = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-15 items-center px-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-mono text-xl font-bold tracking-tight">ALLO</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-1 pb-4">
          {sidebarLinks.map((link, idx) => {
            if (link.isHeader) {
              return (
                <div key={idx} className="mt-4 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {link.name}
                </div>
              );
            }
            
            const Icon = link.icon!;
            const isActive = pathname === link.href;
            
            return (
              <Link key={idx} href={link.href}>
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-muted ${isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{user?.displayName || "User"}</span>
              <span className="text-xs text-muted-foreground mt-1 truncate max-w-30">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Log out">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-muted/20">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex fixed inset-y-0 z-10">
          <SidebarContent />
        </aside>

        {/* Mobile Header & Content */}
        <div className="flex flex-1 flex-col md:pl-64">
          <header className="sticky top-0 z-10 flex h-15 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Access tools and settings.</SheetDescription>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="font-mono text-lg font-bold tracking-tight">ALLO</span>
          </header>
          
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
