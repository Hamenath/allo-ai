"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResumeAnalyzerInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, CheckCircle2, Sparkles, AlertTriangle, ArrowRight, Save, Copy, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function ResumeAnalyzerPage() {
  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof ResumeAnalyzerInputSchema>>({
    resolver: zodResolver(ResumeAnalyzerInputSchema),
    defaultValues: {
      resume: "",
      jobDescription: "",
    },
  });

  async function onSubmit(data: z.infer<typeof ResumeAnalyzerInputSchema>) {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to use this tool");
      }
      
      const token = await user.getIdToken();
      
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          toolId: "resume-analyzer",
          input: data,
        }),
      });
      
      const resData = await response.json();
      
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to analyze resume");
      }
      
      setResult(resData.data.result);
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">AI Resume Analyzer</h1>
          <p className="text-muted-foreground mt-2">
            Compare your resume against a job description to uncover ATS gaps and optimize your application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Input Data
              </CardTitle>
              <CardDescription>
                Paste your resume text and the target job description.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="resume" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Resume Text
                    </label>
                  </div>
                  <Textarea
                    id="resume"
                    placeholder="Paste your full resume here..."
                    className="h-50 resize-none"
                    {...form.register("resume")}
                    disabled={isGenerating}
                  />
                  {form.formState.errors.resume && (
                    <p className="text-sm text-destructive">{form.formState.errors.resume.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="jobDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Target Job Description
                    </label>
                  </div>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job requirements and responsibilities here..."
                    className="h-50 resize-none"
                    {...form.register("jobDescription")}
                    disabled={isGenerating}
                  />
                  {form.formState.errors.jobDescription && (
                    <p className="text-sm text-destructive">{form.formState.errors.jobDescription.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Resume
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="mt-4 flex items-center space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 xl:col-span-8">
          {!result && !isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-dashed border-border/50 text-center shadow-none">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Analysis Yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Paste your resume and a job description on the left, then click analyze to see your ATS score, missing skills, and recommendations.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Analyzing your resume...</h3>
              <p className="text-muted-foreground mt-2">
                Simulating ATS systems and comparing skills...
              </p>
            </Card>
          ) : result ? (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">ATS Compatibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div className="text-4xl font-bold">{result.atsScore}%</div>
                      <Badge variant={result.atsScore > 80 ? "default" : result.atsScore > 60 ? "secondary" : "destructive"} className="mb-1">
                        {result.atsScore > 80 ? "Excellent" : result.atsScore > 60 ? "Average" : "Needs Work"}
                      </Badge>
                    </div>
                    <Progress value={result.atsScore} className="mt-4" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Job Match Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div className="text-4xl font-bold">{result.jobMatchScore}%</div>
                      <Badge variant={result.jobMatchScore > 80 ? "default" : result.jobMatchScore > 60 ? "secondary" : "destructive"} className="mb-1">
                        {result.jobMatchScore > 80 ? "Strong Match" : result.jobMatchScore > 60 ? "Potential Fit" : "Low Match"}
                      </Badge>
                    </div>
                    <Progress value={result.jobMatchScore} className="mt-4" />
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis Tabs */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Detailed Analysis</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Favorite
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs defaultValue="skills" className="w-full">
                    <TabsList className="mb-4 grid w-full grid-cols-3">
                      <TabsTrigger value="skills">Skills & Keywords</TabsTrigger>
                      <TabsTrigger value="feedback">Feedback</TabsTrigger>
                      <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="skills" className="space-y-6">
                      <div>
                        <h4 className="mb-3 flex items-center font-medium">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.matchedSkills.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">{skill}</Badge>
                          ))}
                          {result.matchedSkills.length === 0 && <p className="text-sm text-muted-foreground">No matching skills found.</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="mb-3 flex items-center font-medium">
                          <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                          Missing Skills & Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.missingSkills.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25">{skill}</Badge>
                          ))}
                          {result.missingKeywords.map((keyword: string, i: number) => (
                            <Badge key={`kw-${i}`} variant="outline" className="border-amber-500/50 text-amber-600">{keyword}</Badge>
                          ))}
                          {result.missingSkills.length === 0 && result.missingKeywords.length === 0 && (
                            <p className="text-sm text-muted-foreground">You have all the required skills!</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="feedback" className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                          <h4 className="font-medium text-emerald-600">Strengths</h4>
                          <ul className="space-y-2 text-sm">
                            {result.strengths.map((str: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3 rounded-lg border bg-card p-4">
                          <h4 className="font-medium text-destructive">Weaknesses</h4>
                          <ul className="space-y-2 text-sm">
                            {result.weaknesses.map((weak: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2 mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                                <span>{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Recommendations & Improvements</h4>
                        <div className="space-y-3">
                          {result.recommendations.concat(result.resumeImprovements).map((rec: string, i: number) => (
                            <div key={i} className="rounded-md bg-muted/50 p-3 text-sm">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="interview" className="space-y-4">
                      <h4 className="font-medium">Potential Interview Questions</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Based on the gaps between your resume and the job description, prepare for these questions:
                      </p>
                      <ul className="space-y-3">
                        {result.interviewQuestions.map((q: string, i: number) => (
                          <li key={i} className="flex items-start rounded-lg border p-4">
                            <div className="mr-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium">{q}</span>
                          </li>
                        ))}
                      </ul>
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
