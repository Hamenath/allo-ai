"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  NotificationItem 
} from "@/lib/db/notifications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  CreditCard, 
  AlertTriangle, 
  Info 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const iconMap: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="h-5 w-5 text-indigo-500" />,
  ai_complete: <Sparkles className="h-5 w-5 text-emerald-500" />,
  usage_warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  usage_limit: <AlertTriangle className="h-5 w-5 text-rose-500" />,
  payment_success: <CreditCard className="h-5 w-5 text-emerald-500" />,
  payment_failed: <CreditCard className="h-5 w-5 text-rose-500" />,
  subscription_updated: <CreditCard className="h-5 w-5 text-indigo-500" />,
  subscription_cancelled: <CreditCard className="h-5 w-5 text-amber-500" />,
  system: <Info className="h-5 w-5 text-blue-500" />,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const loadData = async () => {
    if (!user) return;
    try {
      const list = await getNotifications(user.uid, 50);
      setNotifications(list);
    } catch (err) {
      console.error("Error loading notifications page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredList = notifications.filter((n) => (filter === "UNREAD" ? !n.read : true));

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notification Center</h1>
          <p className="text-muted-foreground text-lg">Stay updated with system activity, usage alerts, and billing receipts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === "ALL" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("ALL")}
          >
            All
          </Button>
          <Button 
            variant={filter === "UNREAD" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("UNREAD")}
          >
            Unread
          </Button>
          {notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b py-4">
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" /> Notifications Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredList.length > 0 ? (
            <div className="divide-y">
              {filteredList.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 transition-colors flex items-start gap-4 ${item.read ? 'bg-background' : 'bg-muted/30'}`}
                >
                  <div className="mt-1 p-2 rounded-xl bg-muted/50 shrink-0">
                    {iconMap[item.type] || <Info className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{item.title}</p>
                        {!item.read && <Badge variant="secondary" className="text-[10px]">Unread</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.createdAt?.toDate ? format(item.createdAt.toDate(), "MMM d, HH:mm") : "Recent"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.message}</p>
                    {item.link && (
                      <div className="pt-1">
                        <Link href={item.link} className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                          View details <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!item.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMarkAsRead(item.id!)}
                        title="Mark read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item.id!)}
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Bell className="h-12 w-12 opacity-30 mb-3" />
              <p className="font-semibold">No notifications found</p>
              <p className="text-xs mt-1">You are all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
