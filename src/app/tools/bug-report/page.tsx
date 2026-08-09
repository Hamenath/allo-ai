"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BugReportInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bug, ArrowLeft, AlertCircle, Heart, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BugReportPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof BugReportInputSchema>>({
    resolver: zodResolver(BugReportInputSchema),
    defaultValues: {
      description: "",
      steps: "",
      expected: "",
      actual: "",
      browser: "",
      device: "",
      os: "",
      version: "",
      logs: "",
    },
  });

  async function onSubmit(data: z.infer<typeof BugReportInputSchema>) {
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
          toolId: "bug-report",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate Bug Report");
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
    
    const md = `
# ${result.title}

**Severity:** ${result.severity} | **Priority:** ${result.priority}

## Summary
${result.summary}

## Description
${result.description}

## Steps to Reproduce
${result.stepsToReproduce.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

## Expected Result
${result.expectedResult}

## Actual Result
${result.actualResult}

## Environment
${result.environment.map((e: string) => `- ${e}`).join('\n')}

## Possible Causes
${result.possibleCauses.map((c: string) => `- ${c}`).join('\n')}

## Investigation Steps
${result.investigationSteps.map((i: string) => `- ${i}`).join('\n')}

## Additional Info Needed
${result.additionalInfoNeeded.map((a: string) => `- ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(md);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Low": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "P1": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "P2": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "P3": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/tools"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bug Report Generator</h1>
            <p className="text-muted-foreground">Convert messy bug descriptions into structured, professional bug reports.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] min-h-200">
        {/* Form Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Bug Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Raw Description *</label>
                  <Textarea 
                    {...form.register("description")} 
                    placeholder="Paste the messy bug description here... e.g. 'the login button is spinning forever when I use my phone'" 
                    className="min-h-25 bg-background" 
                  />
                  {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Steps to Reproduce (Optional)</label>
                  <Textarea {...form.register("steps")} placeholder="Any steps you know of..." className="min-h-20 bg-background" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Expected Behavior</label>
                    <Input {...form.register("expected")} placeholder="What should happen?" className="bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Actual Behavior</label>
                    <Input {...form.register("actual")} placeholder="What actually happens?" className="bg-background" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Browser</label>
                    <Input {...form.register("browser")} placeholder="e.g. Chrome" className="bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Device</label>
                    <Input {...form.register("device")} placeholder="e.g. iPhone 13" className="bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">OS</label>
                    <Input {...form.register("os")} placeholder="e.g. iOS 16" className="bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Version</label>
                    <Input {...form.register("version")} placeholder="e.g. v1.2.0" className="bg-background" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Console / Logs (Optional)</label>
                  <Textarea {...form.register("logs")} placeholder="Paste any error logs or stack traces here..." className="min-h-25 font-mono text-sm bg-background" />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-md" disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Bug...</>
                ) : (
                  "Generate Bug Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden bg-muted/10">
          {!result && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Bug className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="font-medium text-lg mb-2 text-foreground">No Bug Report</h3>
              <p className="max-w-md">Paste your raw bug details on the left and click generate to create a structured report ready for Jira or GitHub Issues.</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground h-full space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse font-medium">Structuring bug report...</p>
            </div>
          )}

          {result && !isGenerating && (
            <>
              <CardHeader className="bg-background border-b py-3 px-6 shrink-0 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center">
                  <span className="bg-primary/10 text-primary p-1.5 rounded mr-2">
                    <Bug className="h-4 w-4" />
                  </span>
                  Structured Bug Report
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} title="Copy Markdown">
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => form.handleSubmit(onSubmit)()} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 flex-1 overflow-auto bg-background">
                <div className="max-w-3xl space-y-8">
                  
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(result.severity)}`}>
                        Severity: {result.severity}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(result.priority)}`}>
                        Priority: {result.priority}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">{result.title}</h2>
                    <p className="text-muted-foreground text-sm">{result.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 border-b pb-2">Description</h3>
                      <p className="text-sm whitespace-pre-wrap">{result.description}</p>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Environment</h3>
                      <ul className="space-y-1 text-sm">
                        {result.environment.map((env: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 text-primary">•</span>
                            {env}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 border-b pb-2">Steps to Reproduce</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      {result.stepsToReproduce.map((step: string, idx: number) => (
                        <li key={idx} className="pl-2">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-sm text-green-600 mb-2">Expected Result</h3>
                      <p className="text-sm">{result.expectedResult}</p>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-sm text-red-600 mb-2">Actual Result</h3>
                      <p className="text-sm">{result.actualResult}</p>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-dashed">
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Possible Causes</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {result.possibleCauses.map((cause: string, idx: number) => (
                          <li key={idx} className="flex items-start"><CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/50" /> {cause}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Suggested Investigation</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {result.investigationSteps.map((step: string, idx: number) => (
                          <li key={idx} className="flex items-start"><ArrowLeft className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-primary/50 rotate-180" /> {step}</li>
                        ))}
                      </ul>
                    </div>

                    {result.additionalInfoNeeded && result.additionalInfoNeeded.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                        <h3 className="font-semibold text-sm text-yellow-600 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" /> Additional Info Needed
                        </h3>
                        <ul className="space-y-1 text-sm text-yellow-600">
                          {result.additionalInfoNeeded.map((info: string, idx: number) => (
                            <li key={idx}>- {info}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
