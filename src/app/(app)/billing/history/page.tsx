"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPaymentHistory, PaymentHistoryRecord } from "@/lib/db/subscriptions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Receipt, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function BillingHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<PaymentHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const records = await getPaymentHistory(user.uid);
        setHistory(records);
      } catch (err) {
        console.error("Failed to load payment history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      <div>
        <Link href="/billing" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Plans & Billing
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Payment History</h1>
        <p className="text-muted-foreground text-lg">View your past verified invoices and transaction logs.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b py-4">
          <CardTitle className="text-lg flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-primary" /> Past Transactions
          </CardTitle>
          <CardDescription>All amounts shown in INR.</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="divide-y overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Plan</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        {item.createdAt?.toDate ? format(item.createdAt.toDate(), "MMM d, yyyy") : "Recently"}
                      </td>
                      <td className="px-6 py-4 font-semibold">{item.plan}</td>
                      <td className="px-6 py-4">₹{item.amount} {item.currency}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="secondary" 
                          className={
                            item.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {item.paymentId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-base font-semibold">No payment history yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                When you upgrade to a paid plan, your verified receipts will be displayed here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
