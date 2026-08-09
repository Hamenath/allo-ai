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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GraduationCap, ArrowLeft, AlertCircle, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite, updateGeneration } from "@/lib/db/generations";
import { Badge } from "@/components/ui/badge";

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
      daysPerWeek: 5,
      deadline: "",
      learningStyle: "Mixed",
      topics: "",
      currentStrengths: "",
      currentWeaknesses: "",
      examName: "",
      examDate: "",
      existingResources: "",
    },
  });

  async function onSubmit(data: z.infer<typeof StudyPlannerInputSchema>) {
    setIsGenerating(true);
    setError(null);
    
    const processedData = {
      ...data,
      availableHours: Number(data.availableHours),
      daysPerWeek: Number(data.daysPerWeek),
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
      
      // Initialize completed checklist map if not exists
      const initialResult = resData.data.result;
      if (!initialResult.completedTasks) {
        initialResult.completedTasks = {};
      }

      setResult(initialResult);
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

  const toggleTaskCompletion = async (taskIdx: number) => {
    if (!result || !generationId) return;
    
    const newCompletedTasks = { ...result.completedTasks };
    newCompletedTasks[taskIdx] = !newCompletedTasks[taskIdx];
    
    const newResult = { ...result, completedTasks: newCompletedTasks };
    setResult(newResult);
    
    // Save to Firestore seamlessly
    try {
      await updateGeneration(generationId, { output: newResult });
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const handleRegenerate = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/tools"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Study Planner</h1>
              <p className="text-muted-foreground text-sm">Create personalized study plans and schedules.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-200">
        {/* Form Column */}
        <div className="lg:col-span-4 h-full">
          <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg">Study Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <form id="study-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Subject / Topic *</label>
                    <Input {...form.register("subject")} placeholder="e.g. AWS Solutions Architect" className="bg-background" />
                    {form.formState.errors.subject && <p className="text-sm text-destructive mt-1">{form.formState.errors.subject.message}</p>}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Primary Goal *</label>
                    <Input {...form.register("goal")} placeholder="e.g. Pass the exam in 2 months" className="bg-background" />
                    {form.formState.errors.goal && <p className="text-sm text-destructive mt-1">{form.formState.errors.goal.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Current Level</label>
                      <Select onValueChange={(val) => form.setValue("currentLevel", val as any)} defaultValue={form.getValues("currentLevel")}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Learning Style</label>
                      <Select onValueChange={(val) => form.setValue("learningStyle", val as any)} defaultValue={form.getValues("learningStyle")}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select style" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mixed">Mixed</SelectItem>
                          <SelectItem value="Visual">Visual</SelectItem>
                          <SelectItem value="Auditory">Auditory</SelectItem>
                          <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                          <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Hours / Day *</label>
                      <Input type="number" min="1" max="16" {...form.register("availableHours")} className="bg-background" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Days / Week *</label>
                      <Input type="number" min="1" max="7" {...form.register("daysPerWeek")} className="bg-background" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Deadline / Timeframe *</label>
                    <Input {...form.register("deadline")} placeholder="e.g. 8 weeks" className="bg-background" />
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Optional Details</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Exam Name</label>
                        <Input {...form.register("examName")} className="bg-background h-8 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Exam Date</label>
                        <Input type="date" {...form.register("examDate")} className="bg-background h-8 text-sm" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Topics to Cover</label>
                        <Textarea {...form.register("topics")} placeholder="Specific topics..." className="h-16 text-sm bg-background" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Current Strengths</label>
                        <Input {...form.register("currentStrengths")} placeholder="e.g. Good at networking" className="h-8 text-sm bg-background" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Current Weaknesses</label>
                        <Input {...form.register("currentWeaknesses")} placeholder="e.g. Bad at databases" className="h-8 text-sm bg-background" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1.5 block">Existing Resources</label>
                        <Textarea {...form.register("existingResources")} placeholder="Books or courses you have..." className="h-16 text-sm bg-background" />
                      </div>
                    </div>
                  </div>

                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive flex items-start text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-4 flex justify-end">
              <Button type="submit" form="study-form" disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                ) : (
                  "Generate Plan"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-8 h-full">
          <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden bg-muted/10 relative">
            <CardHeader className="border-b pb-4 bg-background flex flex-row items-center justify-between sticky top-0 z-10">
              <CardTitle className="text-lg">Study Plan Workspace</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFavorite}>
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} /> 
                    {isFavorite ? 'Saved' : 'Favorite'}
                  </Button>
                  <Button variant="default" size="sm" onClick={handleRegenerate}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto bg-muted/10">
              {!result && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 text-center min-h-125">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <GraduationCap className="h-8 w-8 opacity-50" />
                  </div>
                  <p>Fill out your study requirements and click Generate to create your personalized plan.</p>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 min-h-125">
                  <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                  <p className="animate-pulse">Building your perfect study plan...</p>
                </div>
              ) : result ? (
                <div className="p-0">
                  <Tabs defaultValue="overview" className="flex flex-col h-full">
                    <div className="bg-background border-b px-6 py-2 sticky top-0 z-10">
                      <TabsList className="w-full flex">
                        <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                        <TabsTrigger value="weekly" className="flex-1">Weekly Plan</TabsTrigger>
                        <TabsTrigger value="daily" className="flex-1">Daily Plan</TabsTrigger>
                        <TabsTrigger value="progress" className="flex-1">Progress</TabsTrigger>
                        <TabsTrigger value="revision" className="flex-1">Revision</TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-6">
                      <TabsContent value="overview" className="mt-0 space-y-6 outline-none">
                        <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl">
                          <h3 className="font-semibold text-lg text-primary mb-3">Overall Strategy</h3>
                          <p className="text-foreground leading-relaxed">{result.overallStrategy}</p>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg border-b pb-2">Topic Sequence</h3>
                          <div className="grid gap-2">
                            {result.topicSequence?.map((topic: string, idx: number) => (
                              <div key={idx} className="flex items-center bg-background p-3 rounded border shadow-sm">
                                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-3">{idx + 1}</div>
                                <span className="font-medium text-sm">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="weekly" className="mt-0 space-y-6 outline-none">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg border-b pb-2">Weekly Goals</h3>
                          <ul className="space-y-3">
                            {result.weeklyGoals?.map((goal: string, idx: number) => (
                              <li key={idx} className="flex items-start bg-background p-4 rounded-lg border shadow-sm">
                                <CheckCircle2 className="h-5 w-5 mr-3 text-primary shrink-0 mt-0.5" />
                                <span className="text-foreground">{goal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>

                      <TabsContent value="daily" className="mt-0 space-y-6 outline-none">
                        <div className="space-y-6">
                          <h3 className="font-semibold text-lg border-b pb-2">Typical Daily Routine</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {result.dailyTasks?.map((dayObj: any, idx: number) => (
                              <Card key={idx} className="shadow-sm">
                                <CardHeader className="bg-muted/50 py-3">
                                  <CardTitle className="text-base">{dayObj.day}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                  <ul className="space-y-2">
                                    {dayObj.tasks?.map((task: string, taskIdx: number) => (
                                      <li key={taskIdx} className="flex items-start text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2 shrink-0" />
                                        <span className="text-foreground">{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="progress" className="mt-0 space-y-6 outline-none">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="font-semibold text-lg">Master Checklist</h3>
                            <span className="text-sm text-muted-foreground">
                              {Object.values(result.completedTasks || {}).filter(Boolean).length} / {result.progressChecklist?.length || 0} completed
                            </span>
                          </div>
                          
                          <div className="grid gap-3">
                            {result.progressChecklist?.map((item: string, idx: number) => {
                              const isChecked = !!result.completedTasks?.[idx];
                              return (
                                <div 
                                  key={idx} 
                                  className={`flex items-center p-4 rounded-lg border shadow-sm cursor-pointer transition-colors ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-background hover:bg-muted/50'}`}
                                  onClick={() => toggleTaskCompletion(idx)}
                                >
                                  <div className={`h-5 w-5 rounded border flex items-center justify-center mr-4 transition-colors ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-input'}`}>
                                    {isChecked && <CheckCircle2 className="h-3 w-3" />}
                                  </div>
                                  <span className={`text-sm ${isChecked ? 'text-muted-foreground line-through' : 'font-medium'}`}>
                                    {item}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="revision" className="mt-0 space-y-6 outline-none">
                        <div className="space-y-6">
                          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-xl">
                            <h3 className="font-semibold text-lg text-amber-700 dark:text-amber-400 mb-3">Revision Strategy</h3>
                            <p className="text-foreground leading-relaxed">{result.revisionSchedule}</p>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Practice Tasks</h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {result.practiceTasks?.map((task: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground">{task}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Review Checkpoints</h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {result.reviewCheckpoints?.map((cp: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground">{cp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
