"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  ArrowLeft, 
  FileText, 
  Loader2, 
  History,
  Copy
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { 
  saveInvoice, 
  getInvoices, 
  deleteInvoice, 
  Invoice, 
  InvoiceItem 
} from "@/lib/db/invoices";

export default function InvoiceGeneratorPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);

  // Business State
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessGstin, setBusinessGstin] = useState("");

  // Client State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Details
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("$");
  const [notes, setNotes] = useState("Thank you for your business.");

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const fetchInvoices = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const data = await getInvoices(user.uid);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setItems([{ id: Date.now().toString(), name: "", description: "", quantity: 1, unitPrice: 0, tax: 0, discount: 0 }]);
    fetchInvoices();
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: "", description: "", quantity: 1, unitPrice: 0, tax: 0, discount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculations = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      subtotal += itemSubtotal;
      totalTax += (itemSubtotal * (item.tax / 100));
      totalDiscount += item.discount;
    });

    return {
      subtotal,
      totalTax,
      totalDiscount,
      total: subtotal + totalTax - totalDiscount
    };
  }, [items]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to save invoices.");
        return;
      }

      const invoice: Invoice = {
        userId: user.uid,
        businessName, businessEmail, businessPhone, businessAddress, businessGstin,
        clientName, clientEmail, clientPhone, clientAddress,
        invoiceNumber, invoiceDate, dueDate, currency, notes,
        items,
        ...calculations
      };

      if (currentId) invoice.id = currentId;

      const newId = await saveInvoice(user.uid, invoice);
      setCurrentId(newId);
      await fetchInvoices();
      alert("Invoice saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadInvoice = (inv: Invoice) => {
    setCurrentId(inv.id);
    setBusinessName(inv.businessName); setBusinessEmail(inv.businessEmail); setBusinessPhone(inv.businessPhone); setBusinessAddress(inv.businessAddress); setBusinessGstin(inv.businessGstin || "");
    setClientName(inv.clientName); setClientEmail(inv.clientEmail); setClientPhone(inv.clientPhone); setClientAddress(inv.clientAddress);
    setInvoiceNumber(inv.invoiceNumber); setInvoiceDate(inv.invoiceDate); setDueDate(inv.dueDate); setCurrency(inv.currency); setNotes(inv.notes);
    setItems(inv.items);
  };

  const clearForm = () => {
    setCurrentId(undefined);
    setBusinessName(""); setBusinessEmail(""); setBusinessPhone(""); setBusinessAddress(""); setBusinessGstin("");
    setClientName(""); setClientEmail(""); setClientPhone(""); setClientAddress("");
    setInvoiceNumber(`INV-${Math.floor(Math.random() * 10000)}`);
    setInvoiceDate(new Date().toISOString().split('T')[0]); setDueDate(""); setNotes("Thank you for your business.");
    setItems([{ id: Date.now().toString(), name: "", description: "", quantity: 1, unitPrice: 0, tax: 0, discount: 0 }]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteInvoice(user.uid, id);
      if (currentId === id) clearForm();
      await fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and print professional invoices for your business.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearForm}><Plus className="mr-2 h-4 w-4" /> New</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-6 print:hidden">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">Saved Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader><CardTitle className="text-lg text-primary">Your Business Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                <Input placeholder="Email" type="email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} />
                <Input placeholder="Phone" value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} />
                <Textarea placeholder="Address" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
                <Input placeholder="Tax ID / GSTIN (Optional)" value={businessGstin} onChange={e => setBusinessGstin(e.target.value)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg text-primary">Client Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} />
                <Input placeholder="Email" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                <Input placeholder="Phone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                <Textarea placeholder="Address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader><CardTitle className="text-lg text-primary">Invoice Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Input value={currency} onChange={e => setCurrency(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader><CardTitle className="text-lg text-primary">Items</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
                  <div className="flex-1 space-y-4">
                    <Input placeholder="Item Name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                    <Input placeholder="Description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-xs">Qty</label><Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} /></div>
                    <div className="space-y-1"><label className="text-xs">Price</label><Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} /></div>
                    <div className="space-y-1"><label className="text-xs">Tax %</label><Input type="number" value={item.tax} onChange={e => updateItem(item.id, 'tax', Number(e.target.value))} /></div>
                    <div className="space-y-1"><label className="text-xs">Discount</label><Input type="number" value={item.discount} onChange={e => updateItem(item.id, 'discount', Number(e.target.value))} /></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
               <Textarea placeholder="Notes / Payment Instructions" value={notes} onChange={e => setNotes(e.target.value)} className="h-24" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="print:m-0 print:p-0">
          <Card className="max-w-4xl mx-auto shadow-sm print:shadow-none print:border-none">
            <CardContent className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-2">INVOICE</h1>
                  <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-lg">{businessName || "Your Business Name"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{businessAddress}</p>
                  <p className="text-sm text-muted-foreground">{businessEmail}</p>
                  <p className="text-sm text-muted-foreground">{businessPhone}</p>
                  {businessGstin && <p className="text-sm text-muted-foreground">Tax ID: {businessGstin}</p>}
                </div>
              </div>

              <div className="flex justify-between mb-12">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h4>
                  <h3 className="font-semibold text-lg">{clientName || "Client Name"}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{clientAddress}</p>
                  <p className="text-sm text-muted-foreground">{clientEmail}</p>
                  <p className="text-sm text-muted-foreground">{clientPhone}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{invoiceDate}</span></div>
                  <div className="flex justify-between gap-8"><span className="text-muted-foreground">Due:</span> <span className="font-medium">{dueDate || "Upon receipt"}</span></div>
                </div>
              </div>

              <div className="border-b-2 border-primary mb-4 pb-2 flex font-semibold text-sm">
                <div className="flex-1">Description</div>
                <div className="w-24 text-center">Qty</div>
                <div className="w-32 text-right">Unit Price</div>
                <div className="w-32 text-right">Amount</div>
              </div>

              <div className="space-y-4 mb-8">
                {items.map(item => (
                  <div key={item.id} className="flex text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name || "Item Name"}</p>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    </div>
                    <div className="w-24 text-center">{item.quantity}</div>
                    <div className="w-32 text-right">{currency}{(item.unitPrice).toFixed(2)}</div>
                    <div className="w-32 text-right font-medium">{currency}{(item.quantity * item.unitPrice).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mb-12">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span> <span>{currency}{calculations.subtotal.toFixed(2)}</span></div>
                  {calculations.totalDiscount > 0 && <div className="flex justify-between text-sm text-destructive"><span className="text-muted-foreground">Discount</span> <span>-{currency}{calculations.totalDiscount.toFixed(2)}</span></div>}
                  {calculations.totalTax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span> <span>{currency}{calculations.totalTax.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-lg border-t-2 pt-3 text-primary"><span>Total</span> <span>{currency}{calculations.total.toFixed(2)}</span></div>
                </div>
              </div>

              {notes && (
                <div className="mt-8 pt-8 border-t">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary" /> Saved Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : invoices.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">No saved invoices found.</div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                      <div>
                        <h4 className="font-semibold text-lg">{inv.invoiceNumber}</h4>
                        <p className="text-sm text-muted-foreground">{inv.clientName} • {inv.invoiceDate}</p>
                        <p className="text-sm font-medium mt-1">{inv.currency}{inv.total.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => loadInvoice(inv)}>Open</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          const copy = { ...inv, id: undefined, invoiceNumber: `${inv.invoiceNumber}-COPY` };
                          loadInvoice(copy);
                        }}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(inv.id!)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
