"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StudyPlannerInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GraduationCap, ArrowLeft, AlertCircle, Calendar, CheckSquare, ListTodo, Heart, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function StudyPlannerPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof StudyPlannerInputSchema>>({
    resolver: zodResolver(StudyPlannerInputSchema),
    defaultValues: {
      subject: "",
      goal: "",
      currentLevel: "Beginner",
      availableHours: 2,
      deadline: "",
      learningStyle: "Mixed",
      topics: "",
    },
  });

  async function onSubmit(data: z.infer<typeof StudyPlannerInputSchema>) {
    setIsGenerating(true);
    setError(null);
    
    // Ensure availableHours is a number
    const processedData = {
      ...data,
      availableHours: Number(data.availableHours)
    };
    
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
          toolId: "study-planner",
          input: processedData,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate study plan");
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
          <h1 className="text-3xl font-bold tracking-tight">AI Study Planner</h1>
          <p className="text-muted-foreground mt-2">
            Create a highly tailored study strategy, daily schedule, and progress checklist.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                Study Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject / Topic</label>
                  <Input placeholder="e.g., AWS Certified Solutions Architect, Calculus II" {...form.register("subject")} disabled={isGenerating} />
                  {form.formState.errors.subject && <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ultimate Goal</label>
                  <Input placeholder="e.g., Pass the exam with 900+, Get a junior dev job" {...form.register("goal")} disabled={isGenerating} />
                  {form.formState.errors.goal && <p className="text-xs text-destructive">{form.formState.errors.goal.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Level</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("currentLevel", val)} defaultValue={form.getValues("currentLevel")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Learning Style</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("learningStyle", val)} defaultValue={form.getValues("learningStyle")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visual">Visual</SelectItem>
                        <SelectItem value="Auditory">Auditory</SelectItem>
                        <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                        <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hrs/Day</label>
                    <Input type="number" min="1" max="16" {...form.register("availableHours")} disabled={isGenerating} />
                    {form.formState.errors.availableHours && <p className="text-xs text-destructive">{form.formState.errors.availableHours.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline / Timeframe</label>
                    <Input placeholder="e.g., 3 months, Next Friday" {...form.register("deadline")} disabled={isGenerating} />
                    {form.formState.errors.deadline && <p className="text-xs text-destructive">{form.formState.errors.deadline.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Specific Topics (Optional)</label>
                  <Textarea placeholder="List specific topics you want to make sure are covered..." className="h-20 resize-none" {...form.register("topics")} disabled={isGenerating} />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Create Study Plan</>
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
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Plan Generated</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Enter your study goals and constraints to generate a comprehensive learning schedule.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Creating your master plan...</h3>
              <p className="text-muted-foreground mt-2">Allocating hours and structuring topics...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Custom Study Plan</CardTitle>
                  <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto">
                <Tabs defaultValue="strategy" className="w-full">
                  <TabsList className="mb-6 flex flex-wrap h-auto">
                    <TabsTrigger value="strategy">Strategy</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                    <TabsTrigger value="tasks">Checklist</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="strategy" className="space-y-6">
                    <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                      <h3 className="text-lg font-semibold flex items-center mb-2">
                        <GraduationCap className="mr-2 h-5 w-5 text-primary" /> Overall Strategy
                      </h3>
                      <p className="text-sm leading-relaxed">{result.overallStrategy}</p>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-6 border">
                      <h3 className="text-lg font-semibold flex items-center mb-4">
                        <ListTodo className="mr-2 h-5 w-5" /> Weekly Goals
                      </h3>
                      <ul className="space-y-3">
                        {result.weeklyGoals.map((goal: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <div className="mr-3 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                              {idx + 1}
                            </div>
                            <span className="text-sm">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-6 border">
                      <h3 className="text-lg font-semibold mb-2">Revision Strategy</h3>
                      <p className="text-sm leading-relaxed">{result.revisionSchedule}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="schedule">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center mb-4">
                        <Calendar className="mr-2 h-5 w-5" /> Daily Routine
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {result.dailySchedule.map((block: any, idx: number) => (
                          <div key={idx} className="border rounded-lg p-4 bg-card shadow-sm flex flex-col">
                            <div className="flex items-center text-sm font-semibold text-primary mb-2">
                              <Clock className="h-4 w-4 mr-2" /> {block.timeBlock}
                            </div>
                            <h4 className="font-medium text-foreground mb-1">{block.activity}</h4>
                            <p className="text-sm text-muted-foreground mt-auto pt-2 border-t">{block.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="topics">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center mb-4">
                        <ListTodo className="mr-2 h-5 w-5" /> Topic Breakdown
                      </h3>
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3">Topic</th>
                              <th className="px-4 py-3 text-center">Difficulty</th>
                              <th className="px-4 py-3 text-right">Est. Hours</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.topicsBreakdown.map((t: any, idx: number) => (
                              <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-3 font-medium">{t.topic}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    t.difficulty.toLowerCase() === 'hard' ? 'bg-red-500/10 text-red-600' :
                                    t.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                    'bg-green-500/10 text-green-600'
                                  }`}>
                                    {t.difficulty}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">{t.estimatedHours}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tasks" className="space-y-6">
                    <div className="bg-card rounded-lg p-6 border shadow-sm">
                      <h3 className="text-lg font-semibold flex items-center mb-4">
                        <CheckSquare className="mr-2 h-5 w-5 text-primary" /> Practice Tasks
                      </h3>
                      <div className="space-y-3">
                        {result.practiceTasks.map((task: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer" />
                            <span className="text-sm">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card rounded-lg p-6 border shadow-sm">
                      <h3 className="text-lg font-semibold flex items-center mb-4">
                        <CheckSquare className="mr-2 h-5 w-5 text-primary" /> Milestone Checklist
                      </h3>
                      <div className="space-y-3">
                        {result.progressChecklist.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
