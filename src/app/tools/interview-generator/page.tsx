"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InterviewGeneratorInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2, Briefcase, ArrowLeft, AlertCircle, Copy, Save, Heart, RefreshCw } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

const QuestionList = ({ questions, title }: { questions: any[], title: string }) => {
  if (!questions || questions.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Accordion type="single" collapsible className="w-full">
        {questions.map((q, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-left font-medium">
              <div className="flex items-center space-x-2">
                <Badge variant={q.difficulty === "Easy" ? "secondary" : q.difficulty === "Hard" ? "destructive" : "default"}>
                  {q.difficulty}
                </Badge>
                <span>{q.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-md mt-2">
              <div className="mb-2 font-semibold text-foreground flex items-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">Topic:</span>
                <Badge variant="outline">{q.topic}</Badge>
              </div>
              <div className="prose prose-sm dark:prose-invert">
                <p className="font-semibold mb-1">Suggested Answer Focus:</p>
                <p className="whitespace-pre-wrap">{q.suggestedAnswer}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default function InterviewGeneratorPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof InterviewGeneratorInputSchema>>({
    resolver: zodResolver(InterviewGeneratorInputSchema),
    defaultValues: {
      jobTitle: "",
      experienceLevel: "Mid-Level",
      skills: "",
      jobDescription: "",
      interviewType: "Mixed",
    },
  });

  async function onSubmit(data: z.infer<typeof InterviewGeneratorInputSchema>) {
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
          toolId: "interview-generator",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate questions");
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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Interview Question Generator</h1>
          <p className="text-muted-foreground mt-2">
            Practice for your next interview with tailored AI-generated questions and suggested answers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Briefcase className="mr-2 h-5 w-5 text-primary" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input placeholder="e.g., Senior Frontend Developer" {...form.register("jobTitle")} disabled={isGenerating} />
                  {form.formState.errors.jobTitle && <p className="text-xs text-destructive">{form.formState.errors.jobTitle.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience Level</label>
                    <Select disabled={isGenerating} onValueChange={(val) => form.setValue("experienceLevel", val)} defaultValue={form.getValues("experienceLevel")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Lead/Manager">Lead/Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview Type</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("interviewType", val)} defaultValue={form.getValues("interviewType")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Behavioral">Behavioral</SelectItem>
                        <SelectItem value="HR">HR Screen</SelectItem>
                        <SelectItem value="System Design">System Design</SelectItem>
                        <SelectItem value="Mixed">Mixed (All)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Key Skills (Optional)</label>
                  <Input placeholder="e.g., React, TypeScript, Next.js" {...form.register("skills")} disabled={isGenerating} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Description (Optional)</label>
                  <Textarea placeholder="Paste the job description for more accurate questions..." className="h-32 resize-none" {...form.register("jobDescription")} disabled={isGenerating} />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Generate Questions</>
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
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ready to Practice?</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Fill out the role details on the left to generate realistic interview questions and answer guidelines.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Preparing your interview...</h3>
              <p className="text-muted-foreground mt-2">Curating the best questions for this role...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Interview Prep</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => form.handleSubmit(onSubmit)()}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                    </Button>
                    <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap h-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {result.technicalQuestions?.length > 0 && <TabsTrigger value="tech">Technical</TabsTrigger>}
                    {result.behavioralQuestions?.length > 0 && <TabsTrigger value="behavior">Behavioral</TabsTrigger>}
                    {result.systemDesignQuestions?.length > 0 && <TabsTrigger value="sys">System Design</TabsTrigger>}
                    {result.hrQuestions?.length > 0 && <TabsTrigger value="hr">HR</TabsTrigger>}
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-8">
                    <QuestionList questions={result.technicalQuestions} title="Technical Questions" />
                    <QuestionList questions={result.behavioralQuestions} title="Behavioral Questions" />
                    <QuestionList questions={result.systemDesignQuestions} title="System Design Questions" />
                    <QuestionList questions={result.hrQuestions} title="HR Questions" />
                  </TabsContent>
                  
                  <TabsContent value="tech">
                    <QuestionList questions={result.technicalQuestions} title="Technical Questions" />
                  </TabsContent>
                  <TabsContent value="behavior">
                    <QuestionList questions={result.behavioralQuestions} title="Behavioral Questions" />
                  </TabsContent>
                  <TabsContent value="sys">
                    <QuestionList questions={result.systemDesignQuestions} title="System Design Questions" />
                  </TabsContent>
                  <TabsContent value="hr">
                    <QuestionList questions={result.hrQuestions} title="HR Questions" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
