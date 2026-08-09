"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StartupValidatorInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Rocket, ArrowLeft, AlertCircle, Heart, RefreshCw, CheckCircle2, Target, AlertTriangle, Lightbulb, ListTodo, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function StartupValidatorPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof StartupValidatorInputSchema>>({
    resolver: zodResolver(StartupValidatorInputSchema),
    defaultValues: {
      idea: "",
      targetCustomer: "",
      problem: "",
      proposedSolution: "",
      businessModel: "",
      competitors: "",
    },
  });

  async function onSubmit(data: z.infer<typeof StartupValidatorInputSchema>) {
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
          toolId: "startup-validator",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to analyze startup idea");
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Startup Idea Validator</h1>
          <p className="text-muted-foreground mt-2">
            Get an objective, critical AI VC analysis of your next big idea.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Rocket className="mr-2 h-5 w-5 text-primary" />
                Pitch Your Idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">The Idea / Elevator Pitch *</label>
                  <Textarea placeholder="What is it? How does it work?" className="h-20 resize-none" {...form.register("idea")} disabled={isGenerating} />
                  {form.formState.errors.idea && <p className="text-xs text-destructive">{form.formState.errors.idea.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Customer *</label>
                  <Input placeholder="Who pays for this?" {...form.register("targetCustomer")} disabled={isGenerating} />
                  {form.formState.errors.targetCustomer && <p className="text-xs text-destructive">{form.formState.errors.targetCustomer.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">The Problem *</label>
                  <Textarea placeholder="What pain point are you solving?" className="h-16 resize-none" {...form.register("problem")} disabled={isGenerating} />
                  {form.formState.errors.problem && <p className="text-xs text-destructive">{form.formState.errors.problem.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Solution *</label>
                  <Textarea placeholder="How do you solve it?" className="h-16 resize-none" {...form.register("proposedSolution")} disabled={isGenerating} />
                  {form.formState.errors.proposedSolution && <p className="text-xs text-destructive">{form.formState.errors.proposedSolution.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Model</label>
                  <Input placeholder="e.g. SaaS subscription, One-time fee, Ads" {...form.register("businessModel")} disabled={isGenerating} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Competitors</label>
                  <Input placeholder="Who else is doing this?" {...form.register("competitors")} disabled={isGenerating} />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Idea...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Validate Startup Idea</>
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
                <Rocket className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ready to Validate</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Describe your startup idea and AI will analyze its viability, risks, and market potential.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Running VC Analysis...</h3>
              <p className="text-muted-foreground mt-2">Evaluating problem strength and competition...</p>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-bold tracking-tight">AI Validator Report</h2>
                        <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                          <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{result.summary}</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-muted/50 p-6 rounded-xl border border-border/50 min-w-50">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Viability Score</span>
                      <div className={`text-6xl font-black ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">out of 100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm flex items-center"><Target className="w-4 h-4 mr-2 text-blue-500"/> Problem Strength</h3>
                      <span className="font-bold text-lg">{result.problemStrength.score}/10</span>
                    </div>
                    <Progress value={result.problemStrength.score * 10} className={`h-2 mb-4 [&>div]:${getProgressColor(result.problemStrength.score * 10)}`} />
                    <p className="text-xs text-muted-foreground flex-1">{result.problemStrength.analysis}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm flex items-center"><Users className="w-4 h-4 mr-2 text-indigo-500"/> Customer Clarity</h3>
                      <span className="font-bold text-lg">{result.customerClarity.score}/10</span>
                    </div>
                    <Progress value={result.customerClarity.score * 10} className={`h-2 mb-4 [&>div]:${getProgressColor(result.customerClarity.score * 10)}`} />
                    <p className="text-xs text-muted-foreground flex-1">{result.customerClarity.analysis}</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-sm flex items-center"><Lightbulb className="w-4 h-4 mr-2 text-amber-500"/> Value Prop</h3>
                      <span className="font-bold text-lg">{result.valueProposition.score}/10</span>
                    </div>
                    <Progress value={result.valueProposition.score * 10} className={`h-2 mb-4 [&>div]:${getProgressColor(result.valueProposition.score * 10)}`} />
                    <p className="text-xs text-muted-foreground flex-1">{result.valueProposition.analysis}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-orange-500" /> Risks & Challenges</CardTitle></CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {result.risks.map((item: string, i: number) => (
                      <div key={i} className="flex items-start text-sm"><span className="text-orange-500 mr-2 mt-0.5">•</span><span className="text-muted-foreground">{item}</span></div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center"><ListTodo className="mr-2 h-4 w-4 text-emerald-500" /> MVP Features</CardTitle></CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {result.mvpFeatures.map((item: string, i: number) => (
                      <div key={i} className="flex items-start text-sm"><span className="text-emerald-500 mr-2 mt-0.5"><CheckCircle2 className="w-4 h-4"/></span><span className="text-muted-foreground">{item}</span></div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Competition Analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.competitionAnalysis}</p>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-md p-3 mt-4 text-xs text-orange-600 font-medium">
                    Note: AI competitive analysis is based on general market patterns and reasoning, not real-time web scraping.
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm bg-muted/20 border-transparent">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Business Model Ideas</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.businessModelSuggestions.map((item: string, i: number) => <li key={i} className="border-b border-border/50 pb-2 last:border-0">- {item}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="shadow-sm bg-muted/20 border-transparent">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Go-to-Market Ideas</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.goToMarketIdeas.map((item: string, i: number) => <li key={i} className="border-b border-border/50 pb-2 last:border-0">- {item}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-primary mb-3">Validation Questions to Ask Customers</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.validationQuestions.map((item: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <span className="font-bold mr-2 text-primary">{i+1}.</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-primary/20">
                    <h3 className="font-bold text-primary mb-3 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Next Steps</h3>
                    <ul className="space-y-2 text-sm text-foreground">
                      {result.nextSteps.map((item: string, i: number) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
