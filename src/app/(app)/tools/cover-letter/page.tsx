"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CoverLetterGeneratorInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileSignature, ArrowLeft, AlertCircle, Copy, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function CoverLetterGeneratorPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<z.infer<typeof CoverLetterGeneratorInputSchema>>({
    resolver: zodResolver(CoverLetterGeneratorInputSchema),
    defaultValues: {
      resume: "",
      company: "",
      jobTitle: "",
      jobDescription: "",
      tone: "Professional",
    },
  });

  async function onSubmit(data: z.infer<typeof CoverLetterGeneratorInputSchema>) {
    setIsGenerating(true);
    setError(null);
    setCopied(false);
    
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
          toolId: "cover-letter",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate cover letter");
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
    const fullText = `${result.opening}\n\n${result.relevantExperience}\n\n${result.companyAlignment}\n\n${result.closing}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Cover Letter Generator</h1>
          <p className="text-muted-foreground mt-2">
            Instantly write a personalized, highly tailored cover letter using your resume and the job description.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileSignature className="mr-2 h-5 w-5 text-primary" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Resume</label>
                  <Textarea placeholder="Paste your full resume here..." className="h-40 resize-none" {...form.register("resume")} disabled={isGenerating} />
                  {form.formState.errors.resume && <p className="text-xs text-destructive">{form.formState.errors.resume.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Company</label>
                    <Input placeholder="e.g., Google" {...form.register("company")} disabled={isGenerating} />
                    {form.formState.errors.company && <p className="text-xs text-destructive">{form.formState.errors.company.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input placeholder="e.g., Product Manager" {...form.register("jobTitle")} disabled={isGenerating} />
                    {form.formState.errors.jobTitle && <p className="text-xs text-destructive">{form.formState.errors.jobTitle.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Description (Optional)</label>
                  <Textarea placeholder="Paste the job description to align your letter..." className="h-32 resize-none" {...form.register("jobDescription")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("tone", val)} defaultValue={form.getValues("tone")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Confident">Confident</SelectItem>
                      <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting Letter...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Generate Cover Letter</>
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
                <FileSignature className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Letter Generated</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Paste your resume and the target role details to instantly generate a professional cover letter.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Drafting your cover letter...</h3>
              <p className="text-muted-foreground mt-2">Aligning your experience with the job description...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Cover Letter</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                      {copied ? "Copied" : "Copy All"}
                    </Button>
                    <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 flex-1">
                <div className="bg-muted/10 border p-8 rounded-lg max-w-3xl mx-auto shadow-sm">
                  <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed font-serif">
                    <p>{result.opening}</p>
                    <p>{result.relevantExperience}</p>
                    <p>{result.companyAlignment}</p>
                    <p>{result.closing}</p>
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
