"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  NotificationPreferences 
} from "@/lib/db/preferences";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Mail, CreditCard, Sparkles, ShieldCheck, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailNotifications: true,
    inAppNotifications: true,
    billingNotifications: true,
    usageNotifications: true,
    productNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      if (!user) return;
      try {
        const p = await getNotificationPreferences(user.uid);
        setPrefs(p);
      } catch (err) {
        console.error("Error loading notification preferences:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPrefs();
  }, [user]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateNotificationPreferences(user.uid, prefs);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto py-4">
      <div>
        <Link href="/settings" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Account Settings
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground text-lg">Control how and when ALLO communicates with you.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-lg flex items-center">
            <Bell className="mr-2 h-5 w-5 text-primary" /> Channel Preferences
          </CardTitle>
          <CardDescription>Choose your preferred communication channels.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Channel Toggles */}
          <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> Email Notifications
              </p>
              <p className="text-xs text-muted-foreground">Receive transactional & system emails to {user?.email}</p>
            </div>
            <Button 
              variant={prefs.emailNotifications ? "default" : "outline"} 
              size="sm"
              onClick={() => handleToggle("emailNotifications")}
            >
              {prefs.emailNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> In-App Bell Notifications
              </p>
              <p className="text-xs text-muted-foreground">Display alerts in navigation bell dropdown</p>
            </div>
            <Button 
              variant={prefs.inAppNotifications ? "default" : "outline"} 
              size="sm"
              onClick={() => handleToggle("inAppNotifications")}
            >
              {prefs.inAppNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold mb-4">Category Controls</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Essential Account & Security
                  </p>
                  <p className="text-xs text-muted-foreground">Password resets, login verification, security alerts</p>
                </div>
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Billing & Payment Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">Payment receipts, renewal updates, subscription state</p>
                </div>
                <Button 
                  variant={prefs.billingNotifications ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleToggle("billingNotifications")}
                >
                  {prefs.billingNotifications ? "ON" : "OFF"}
                </Button>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Monthly AI Quota & Usage Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">80% warning and 100% quota limit reached alerts</p>
                </div>
                <Button 
                  variant={prefs.usageNotifications ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleToggle("usageNotifications")}
                >
                  {prefs.usageNotifications ? "ON" : "OFF"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              <Check className="mr-1 h-4 w-4" /> Preferences saved!
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Changes take effect immediately.</span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
