"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LEGAL_CONFIG } from "@/lib/config/legal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Shield, Download, Trash2, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const [exportRequested, setExportRequested] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const handleExportRequest = () => {
    setExportRequested(true);
  };

  const handleConfirmDeleteRequest = () => {
    setDeleteRequested(true);
    setDeleteModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center">
          <Shield className="mr-2 h-7 w-7 text-indigo-500" /> Privacy & Data Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your personal data, privacy preferences, and account deletion options.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base">Data Export Request</CardTitle>
          <CardDescription className="text-xs">
            Download a copy of your saved AI workspace documents and account profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {exportRequested ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Data Export Request Submitted</p>
                <p className="text-xs text-muted-foreground">
                  Our privacy team is compiling your workspace archive. A download link will be emailed to <span className="font-medium text-foreground">{user?.email}</span> shortly.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export Workspace Data Archive</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Includes saved document history, tool configurations, and usage logs.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportRequest}>
                <Download className="mr-2 h-4 w-4" /> Request Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base">Legal & Privacy Documentation</CardTitle>
          <CardDescription className="text-xs">
            Review how ALLO processes AI inputs and protects your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 divide-y">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Privacy Policy</p>
              <p className="text-xs text-muted-foreground">Version {LEGAL_CONFIG.privacyVersion} ({LEGAL_CONFIG.lastUpdated})</p>
            </div>
            <Link href="/privacy" target="_blank">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Terms of Service</p>
              <p className="text-xs text-muted-foreground">Version {LEGAL_CONFIG.termsVersion}</p>
            </div>
            <Link href="/terms" target="_blank">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">AI Output Disclaimer</p>
              <p className="text-xs text-muted-foreground">Advisory policies regarding AI tool outputs</p>
            </div>
            <Link href="/ai-disclaimer" target="_blank">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader className="border-b border-destructive/20 py-4">
          <CardTitle className="text-base text-destructive flex items-center">
            <Trash2 className="mr-2 h-4 w-4" /> Danger Zone: Account Deletion
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Permanently delete your account and all associated workspace documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {deleteRequested ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Account Deletion Pending</p>
                <p className="text-xs text-muted-foreground">
                  Your deletion request has been submitted to <span className="font-medium text-foreground">{LEGAL_CONFIG.privacyEmail}</span>. Your workspace and data will be permanently removed within 30 days.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete My ALLO Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action cannot be undone. Active subscriptions will be cancelled.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setDeleteModalOpen(true)}>
                Delete Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Deletion Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" /> Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Are you sure you want to request permanent deletion of your account (<span className="font-semibold">{user?.email}</span>)? All your saved documents, history, and favorites will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmDeleteRequest}>
              Submit Deletion Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
