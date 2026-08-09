"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProposalInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Handshake, ArrowLeft, AlertCircle, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function ProposalPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof ProposalInputSchema>>({
    resolver: zodResolver(ProposalInputSchema),
    defaultValues: {
      clientName: "",
      company: "",
      projectName: "",
      projectRequirements: "",
      problem: "",
      proposedSolution: "",
      services: "",
      deliverables: "",
      timeline: "",
      budget: "",
      paymentTerms: "",
    },
  });

  async function onSubmit(data: z.infer<typeof ProposalInputSchema>) {
    setIsGenerating(true);
    setError(null);
    
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
          toolId: "proposal",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate proposal");
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

  const copyToClipboard = () => {
    if (!result) return;
    const text = `
PROJECT PROPOSAL
Client: ${form.getValues("clientName")} ${form.getValues("company") ? `(${form.getValues("company")})` : ""}
Project: ${form.getValues("projectName")}

EXECUTIVE SUMMARY
${result.executiveSummary}

THE PROBLEM
${result.clientProblem}

OUR PROPOSED SOLUTION
${result.proposedSolution}

SCOPE OF WORK
${result.scope.map((r: string) => `- ${r}`).join('\n')}

DELIVERABLES
${result.deliverables.map((r: string) => `- ${r}`).join('\n')}

TIMELINE
${result.timeline.map((t: any) => `- ${t.phase} (${t.duration}): ${t.description}`).join('\n')}

PRICING & INVESTMENT
${result.pricing.map((p: any) => `- ${p.item}: ${p.cost}`).join('\n')}

TERMS & CONDITIONS
${result.terms.map((r: string) => `- ${r}`).join('\n')}

NEXT STEPS
${result.nextSteps}
    `.trim();
    
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Client Proposal Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create persuasive, structured proposals for your clients in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Handshake className="mr-2 h-5 w-5 text-primary" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Client Name *</label>
                    <Input placeholder="John Doe" {...form.register("clientName")} disabled={isGenerating} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input placeholder="Acme Corp" {...form.register("company")} disabled={isGenerating} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name *</label>
                  <Input placeholder="Website Redesign" {...form.register("projectName")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Requirements *</label>
                  <Textarea placeholder="What exactly do they need done?" className="h-20 resize-none" {...form.register("projectRequirements")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Problem</label>
                  <Textarea placeholder="Why do they need this?" className="h-16 resize-none" {...form.register("problem")} disabled={isGenerating} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Services & Deliverables</label>
                  <Textarea placeholder="List what you will provide..." className="h-16 resize-none" {...form.register("deliverables")} disabled={isGenerating} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Budget</label>
                    <Input placeholder="e.g. $5,000" {...form.register("budget")} disabled={isGenerating} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeline</label>
                    <Input placeholder="e.g. 4 Weeks" {...form.register("timeline")} disabled={isGenerating} />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Create Proposal</>
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
                <Handshake className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Generate a Proposal</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Enter your client and project details to create a winning proposal structure.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Drafting Proposal...</h3>
              <p className="text-muted-foreground mt-2">Structuring timeline and pricing...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Project Proposal: {form.getValues("projectName")}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>Copy</Button>
                    <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto space-y-8">
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary uppercase text-sm tracking-wider">Executive Summary</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{result.executiveSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-primary uppercase text-sm tracking-wider">The Problem</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{result.clientProblem}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-primary uppercase text-sm tracking-wider">Proposed Solution</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{result.proposedSolution}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary uppercase text-sm tracking-wider flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Scope & Deliverables</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    {result.scope.map((item: string, i: number) => (
                      <li key={i} className="flex items-start"><span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>{item}</li>
                    ))}
                  </ul>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-sm">Key Deliverables:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {result.deliverables.map((item: string, i: number) => (
                        <li key={i}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary uppercase text-sm tracking-wider">Timeline</h3>
                  <div className="space-y-3">
                    {result.timeline.map((t: any, i: number) => (
                      <div key={i} className="flex gap-4 p-3 border rounded-lg">
                        <div className="font-semibold text-primary w-24 shrink-0">{t.duration}</div>
                        <div>
                          <p className="font-medium text-sm">{t.phase}</p>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary uppercase text-sm tracking-wider">Pricing</h3>
                  <div className="space-y-2">
                    {result.pricing.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between p-3 border-b border-dashed">
                        <span className="text-sm">{p.item}</span>
                        <span className="font-semibold text-sm">{p.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary uppercase text-sm tracking-wider">Terms & Next Steps</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                    {result.terms.map((item: string, i: number) => (
                      <li key={i}>- {item}</li>
                    ))}
                  </ul>
                  <div className="bg-primary/10 text-primary p-4 rounded-lg border border-primary/20">
                    <p className="font-medium text-sm">{result.nextSteps}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
