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
  Wand2,
  FolderOpen,
  PieChart,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommandPalette } from "../../components/CommandPalette";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Tools", isHeader: true },
  { name: "Career", href: "/tools?category=Career", icon: Briefcase },
  { name: "Business", href: "/tools?category=Business", icon: FileText },
  { name: "Developer", href: "/tools?category=Developer", icon: Code },
  { name: "Productivity", href: "/tools?category=Productivity", icon: Sparkles },
  { name: "Learning", href: "/tools?category=Learning", icon: GraduationCap },
  { name: "Your Space", isHeader: true },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "History", href: "/history", icon: History },
  { name: "Favorites", href: "/favorites", icon: Heart },
  { name: "Account", isHeader: true },
  { name: "Usage", href: "/usage", icon: PieChart },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

const SidebarContent = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="font-mono text-2xl font-bold tracking-tight">ALLO</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-1 pb-4">
          {sidebarLinks.map((link, idx) => {
            if (link.isHeader) {
              return (
                <div key={idx} className="mt-5 mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {link.name}
                </div>
              );
            }
            
            const Icon = link.icon!;
            const isActive = link.href && (pathname === link.href || (link.href.includes("?") && pathname.startsWith("/tools")));
            
            return (
              <Link key={idx} href={link.href || "#"}>
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
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium leading-none truncate">{user?.displayName || "User"}</span>
              <span className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 ml-2" onClick={logout} title="Log out">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <div className="flex min-h-screen bg-background">
        <CommandPalette />
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex fixed inset-y-0 z-20">
          <SidebarContent />
        </aside>

        {/* Mobile Header & Content */}
        <div className="flex flex-1 flex-col md:pl-64">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
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
              <span className="font-mono text-xl font-bold tracking-tight">ALLO</span>
            </div>
            <NotificationBell />
          </header>
          
          <div className="hidden md:flex h-14 items-center justify-end px-8 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
            <NotificationBell />
          </div>
          
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
