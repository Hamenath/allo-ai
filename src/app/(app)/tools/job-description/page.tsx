"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JobDescriptionInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BriefcaseBusiness, ArrowLeft, AlertCircle, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function JobDescriptionPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof JobDescriptionInputSchema>>({
    resolver: zodResolver(JobDescriptionInputSchema),
    defaultValues: {
      jobTitle: "",
      department: "",
      experienceLevel: "",
      location: "",
      employmentType: "",
      skills: "",
      responsibilities: "",
      companyDescription: "",
      salary: "",
    },
  });

  async function onSubmit(data: z.infer<typeof JobDescriptionInputSchema>) {
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
          toolId: "job-description",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate job description");
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
${result.jobSummary}

Responsibilities:
${result.responsibilities.map((r: string) => `- ${r}`).join('\n')}

Required Qualifications:
${result.requiredQualifications.map((r: string) => `- ${r}`).join('\n')}

Preferred Qualifications:
${result.preferredQualifications.map((r: string) => `- ${r}`).join('\n')}

Skills:
${result.skills.map((r: string) => `- ${r}`).join('\n')}

Benefits:
${result.benefits.map((r: string) => `- ${r}`).join('\n')}

How to Apply:
${result.applicationInstructions}
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
          <h1 className="text-3xl font-bold tracking-tight">Job Description Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate professional, inclusive, and compelling job descriptions instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BriefcaseBusiness className="mr-2 h-5 w-5 text-primary" />
                Job Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input placeholder="e.g., Senior Frontend Engineer" {...form.register("jobTitle")} disabled={isGenerating} />
                  {form.formState.errors.jobTitle && <p className="text-xs text-destructive">{form.formState.errors.jobTitle.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <Input placeholder="e.g., Engineering" {...form.register("department")} disabled={isGenerating} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience Level</label>
                    <Input placeholder="e.g., Mid-Level, 3-5 years" {...form.register("experienceLevel")} disabled={isGenerating} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input placeholder="e.g., Remote, NY" {...form.register("location")} disabled={isGenerating} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Input placeholder="e.g., Full-time, Contract" {...form.register("employmentType")} disabled={isGenerating} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Skills</label>
                  <Textarea placeholder="e.g., React, TypeScript, Node.js" className="h-20 resize-none" {...form.register("skills")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Responsibilities (Rough Draft)</label>
                  <Textarea placeholder="Briefly list what they will do..." className="h-20 resize-none" {...form.register("responsibilities")} disabled={isGenerating} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Description</label>
                  <Textarea placeholder="We are a fast-growing startup..." className="h-20 resize-none" {...form.register("companyDescription")} disabled={isGenerating} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary / Compensation (Optional)</label>
                  <Input placeholder="e.g., $100k - $120k + Equity" {...form.register("salary")} disabled={isGenerating} />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Generate Job Description</>
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
                <BriefcaseBusiness className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ready to Generate</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Fill in the job details on the left, and AI will write a professional and engaging job description.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Writing Job Description...</h3>
              <p className="text-muted-foreground mt-2">Crafting responsibilities and requirements...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>{form.getValues("jobTitle")} - Job Description</CardTitle>
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
                  <h3 className="text-lg font-semibold mb-2">Job Summary</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{result.jobSummary}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> Responsibilities</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {result.responsibilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-start"><span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> Required Qualifications</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {result.requiredQualifications.map((item: string, i: number) => (
                      <li key={i} className="flex items-start"><span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>{item}</li>
                    ))}
                  </ul>
                </div>

                {result.preferredQualifications?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> Preferred Qualifications</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.preferredQualifications.map((item: string, i: number) => (
                        <li key={i} className="flex items-start"><span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"></span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.skills.map((skill: string, i: number) => (
                      <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>

                {result.benefits?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center"><CheckCircle2 className="mr-2 h-5 w-5 text-primary" /> Benefits</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.benefits.map((item: string, i: number) => (
                        <li key={i} className="flex items-start"><span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="text-sm font-semibold mb-2">How to Apply</h3>
                  <p className="text-sm text-muted-foreground">{result.applicationInstructions}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
