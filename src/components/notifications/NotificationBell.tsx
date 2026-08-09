"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  NotificationItem 
} from "@/lib/db/notifications";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Sparkles, 
  CreditCard, 
  AlertTriangle, 
  Info,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const iconMap: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="h-4 w-4 text-indigo-500" />,
  ai_complete: <Sparkles className="h-4 w-4 text-emerald-500" />,
  usage_warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  usage_limit: <AlertTriangle className="h-4 w-4 text-rose-500" />,
  payment_success: <CreditCard className="h-4 w-4 text-emerald-500" />,
  payment_failed: <CreditCard className="h-4 w-4 text-rose-500" />,
  subscription_updated: <CreditCard className="h-4 w-4 text-indigo-500" />,
  subscription_cancelled: <CreditCard className="h-4 w-4 text-amber-500" />,
  system: <Info className="h-4 w-4 text-blue-500" />,
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const list = await getNotifications(user.uid, 10);
      setNotifications(list);
      const count = await getUnreadCount(user.uid);
      setUnreadCount(count);
    } catch (err) {
      console.error("Error loading notification bell data:", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Polling every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-muted-foreground hover:text-foreground"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 sm:w-96 p-0 shadow-lg" align="end">
        <div className="flex items-center justify-between border-b p-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead} 
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 text-xs transition-colors flex gap-3 ${item.read ? 'bg-background' : 'bg-muted/30'}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {iconMap[item.type] || <Info className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-foreground line-clamp-1">{item.title}</p>
                      {!item.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleMarkAsRead(item.id!)}
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed line-clamp-2">{item.message}</p>
                    {item.link && (
                      <Link 
                        href={item.link} 
                        onClick={() => setOpen(false)}
                        className="text-primary hover:underline flex items-center gap-1 font-medium pt-1"
                      >
                        View details <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No notifications yet
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-2 text-center bg-muted/10">
          <Link href="/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
              View Notification Center →
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
