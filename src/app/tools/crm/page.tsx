"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Search, 
  MoreVertical, 
  Loader2, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  Pencil,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { saveClient, getClients, deleteClient, CRMClient, CRMClientStatus } from "@/lib/db/crm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CRMPage() {
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<CRMClientStatus>("New");
  const [source, setSource] = useState("");
  const [dealValue, setDealValue] = useState<number>(0);
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const data = await getClients(user.uid);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const metrics = useMemo(() => {
    let total = clients.length;
    let activeLeads = 0;
    let openDeals = 0;
    let wonDeals = 0;
    let lostDeals = 0;
    let pipeline = 0;

    clients.forEach(c => {
      if (c.status === "New" || c.status === "Contacted" || c.status === "Qualified") activeLeads++;
      if (c.status === "Proposal" || c.status === "Negotiation") openDeals++;
      if (c.status === "Won") wonDeals++;
      if (c.status === "Lost") lostDeals++;
      if (c.status !== "Lost" && c.status !== "Won") pipeline += c.dealValue;
    });

    return { total, activeLeads, openDeals, wonDeals, lostDeals, pipeline };
  }, [clients]);

  const openNewForm = () => {
    setCurrentId(undefined);
    setName(""); setCompany(""); setEmail(""); setPhone(""); setWebsite("");
    setStatus("New"); setSource(""); setDealValue(0); setFollowUpDate(""); setNotes("");
    setIsFormOpen(true);
  };

  const openEditForm = (client: CRMClient) => {
    setCurrentId(client.id);
    setName(client.name); setCompany(client.company); setEmail(client.email); setPhone(client.phone); setWebsite(client.website);
    setStatus(client.status); setSource(client.source); setDealValue(client.dealValue); setFollowUpDate(client.followUpDate); setNotes(client.notes);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Name is required");
      return;
    }
    
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      if (!user) return;

      const clientData: Omit<CRMClient, "userId" | "createdAt" | "updatedAt"> & { id?: string } = {
        name, company, email, phone, website, status, source, dealValue, followUpDate, notes
      };
      if (currentId) clientData.id = currentId;

      await saveClient(user.uid, clientData);
      await fetchClients();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client forever?")) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteClient(user.uid, id);
      await fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: CRMClientStatus) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const client = clients.find(c => c.id === id);
      if (!client) return;

      await saveClient(user.uid, {
        id, name: client.name, company: client.company, email: client.email, phone: client.phone, website: client.website,
        source: client.source, dealValue: client.dealValue, followUpDate: client.followUpDate, notes: client.notes,
        status: newStatus
      });
      await fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (s: CRMClientStatus) => {
    switch (s) {
      case "New": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Contacted": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Qualified": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Proposal": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Negotiation": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Won": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Lost": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  if (isFormOpen) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsFormOpen(false)}><ArrowLeft className="mr-2 h-4 w-4" /> Back to CRM</Button>
          <h2 className="text-2xl font-bold">{currentId ? "Edit Client" : "New Client"}</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Name *</label><Input required value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Company</label><Input value={company} onChange={e => setCompany(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Won">Won</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2"><label className="text-sm font-medium">Deal Value ($)</label><Input type="number" min="0" value={dealValue} onChange={e => setDealValue(Number(e.target.value))} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Lead Source</label><Input value={source} onChange={e => setSource(e.target.value)} /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Follow-up Date</label><Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Website</label><Input type="url" placeholder="https://" value={website} onChange={e => setWebsite(e.target.value)} /></div>
                <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Notes</label><Textarea className="h-32" value={notes} onChange={e => setNotes(e.target.value)} /></div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Freelancer CRM</h1>
          <p className="text-muted-foreground mt-2">
            Manage your clients, leads, and pipeline all in one place.
          </p>
        </div>
        <Button onClick={openNewForm}><Plus className="mr-2 h-4 w-4" /> Add Client</Button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase">Total Clients</p><p className="text-2xl font-bold mt-1 flex items-center"><Users className="h-4 w-4 mr-2 text-primary" />{metrics.total}</p></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase">Active Leads</p><p className="text-2xl font-bold mt-1 flex items-center"><TrendingUp className="h-4 w-4 mr-2 text-blue-500" />{metrics.activeLeads}</p></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase">Open Deals</p><p className="text-2xl font-bold mt-1 flex items-center"><Briefcase className="h-4 w-4 mr-2 text-orange-500" />{metrics.openDeals}</p></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase">Won Deals</p><p className="text-2xl font-bold mt-1 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />{metrics.wonDeals}</p></CardContent></Card>
        <Card className="shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase">Lost Deals</p><p className="text-2xl font-bold mt-1 flex items-center"><XCircle className="h-4 w-4 mr-2 text-red-500" />{metrics.lostDeals}</p></CardContent></Card>
        <Card className="shadow-sm border-primary/50 bg-primary/5"><CardContent className="p-4"><p className="text-xs text-primary font-medium uppercase">Pipeline Value</p><p className="text-2xl font-bold mt-1 text-primary">${metrics.pipeline.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
          <CardTitle className="text-lg">Clients & Leads</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search clients..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center p-12">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">No clients found</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">You don't have any clients matching your search.</p>
              <Button variant="outline" onClick={openNewForm}>Add your first client</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name / Company</th>
                    <th className="px-6 py-4 font-medium">Contact Info</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Deal Value</th>
                    <th className="px-6 py-4 font-medium">Follow-up</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.company}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="truncate max-w-50">{client.email}</p>
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${client.dealValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {client.followUpDate || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(client)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(client.id!, "Qualified")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Qualified
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(client.id!, "Won")}>
                              <TrendingUp className="mr-2 h-4 w-4" /> Mark Won
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(client.id!)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// A generic lucide icon for save
function Save(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
}
