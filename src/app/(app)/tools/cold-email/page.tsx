"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ColdEmailGeneratorInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, ArrowLeft, AlertCircle, Copy, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function ColdEmailGeneratorPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ColdEmailGeneratorInputSchema>>({
    resolver: zodResolver(ColdEmailGeneratorInputSchema),
    defaultValues: {
      recipientType: "",
      recipientName: "",
      company: "",
      purpose: "",
      userBackground: "",
      offerInfo: "",
      tone: "Professional",
    },
  });

  async function onSubmit(data: z.infer<typeof ColdEmailGeneratorInputSchema>) {
    setIsGenerating(true);
    setError(null);
    setCopiedSection(null);
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to use this tool");
      
      const token = await user.getIdToken();
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          toolId: "cold-email",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate email");
      }
      
      setResult(resData.data.result);
      setGenerationId(resData.data.id);
      setIsFavorite(false);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleFavorite = async () => {
    if (!generationId) return;
    try {
      await toggleFavorite(generationId, isFavorite);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Failed to favorite", err);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Cold Email Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate high-converting, personalized cold outreach emails for sales, networking, or job hunting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                Email Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Role</label>
                    <Input placeholder="e.g., CTO, Recruiter" {...form.register("recipientType")} disabled={isGenerating} />
                    {form.formState.errors.recipientType && <p className="text-xs text-destructive">{form.formState.errors.recipientType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recipient Name</label>
                    <Input placeholder="e.g., John Doe" {...form.register("recipientName")} disabled={isGenerating} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Company</label>
                  <Input placeholder="e.g., Acme Corp" {...form.register("company")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose of Email</label>
                  <Textarea placeholder="e.g., Request a quick intro call, pitch my SEO service" className="h-16 resize-none" {...form.register("purpose")} disabled={isGenerating} />
                  {form.formState.errors.purpose && <p className="text-xs text-destructive">{form.formState.errors.purpose.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Background (Optional)</label>
                  <Input placeholder="e.g., 5 yrs B2B SaaS sales" {...form.register("userBackground")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Offer / Value Prop (Optional)</label>
                  <Textarea placeholder="e.g., We help companies save 30% on cloud costs..." className="h-16 resize-none" {...form.register("offerInfo")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("tone", val)} defaultValue={form.getValues("tone")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing Email...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Generate Emails</>
                  )}
                </Button>
                
                {error && (
                  <div className="flex items-center space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" /><span>{error}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 xl:col-span-8">
          {!result && !isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-dashed border-border/50 text-center shadow-none p-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Email Generated</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Fill out the recipient details and purpose to generate a professional cold email sequence.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Drafting sequence...</h3>
              <p className="text-muted-foreground mt-2">Personalizing the outreach...</p>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Suggested Subject Lines</CardTitle>
                    <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {result.subjectLines.map((subject: string, idx: number) => (
                      <li key={idx} className="flex items-center justify-between bg-muted/40 p-3 rounded-md border text-sm font-medium">
                        <span>{subject}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(subject, `subj-${idx}`)}>
                          {copiedSection === `subj-${idx}` ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm flex flex-col">
                <CardHeader className="border-b pb-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Email Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="full" className="w-full">
                    <TabsList className="mb-6 grid w-full grid-cols-3">
                      <TabsTrigger value="full">Full Email</TabsTrigger>
                      <TabsTrigger value="short">Short Version</TabsTrigger>
                      <TabsTrigger value="followup">Follow Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="full">
                      <div className="bg-muted/30 rounded-lg p-6 border relative group whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {result.fullEmail}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="shadow-sm" onClick={() => copyToClipboard(result.fullEmail, 'full')}>
                            {copiedSection === 'full' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="short">
                      <div className="bg-muted/30 rounded-lg p-6 border relative group whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {result.shortEmail}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="shadow-sm" onClick={() => copyToClipboard(result.shortEmail, 'short')}>
                            {copiedSection === 'short' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="followup">
                      <div className="bg-muted/30 rounded-lg p-6 border relative group whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {result.followUpEmail}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="shadow-sm" onClick={() => copyToClipboard(result.followUpEmail, 'followup')}>
                            {copiedSection === 'followup' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                            Copy
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
