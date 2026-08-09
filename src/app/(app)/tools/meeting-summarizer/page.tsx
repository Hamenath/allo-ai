"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MeetingSummarizerInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Users, ArrowLeft, Heart, RefreshCw, Copy, CheckCircle, Edit3, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite, updateGeneration } from "@/lib/db/generations";
import { Badge } from "@/components/ui/badge";

export default function MeetingSummarizerPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<any>(null);

  const form = useForm<z.infer<typeof MeetingSummarizerInputSchema>>({
    resolver: zodResolver(MeetingSummarizerInputSchema),
    defaultValues: {
      title: "",
      date: "",
      transcript: "",
    },
  });

  async function onSubmit(data: z.infer<typeof MeetingSummarizerInputSchema>) {
    setIsGenerating(true);
    setError(null);
    setIsEditing(false);
    
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
          toolId: "meeting-summarizer",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate summary");
      }
      
      setResult(resData.data.result);
      setEditedResult(resData.data.result);
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
## Meeting Summary: ${form.getValues("title")}
Date: ${form.getValues("date") || "Not provided"}

### Summary
${result.summary}

### Key Points
${result.keyPoints?.map((p: string) => "- " + p).join("\\n")}

### Decisions
${result.decisions?.map((p: string) => "- " + p).join("\\n")}

### Action Items
${result.actionItems?.map((a: any) => `- ${a.task} ${a.owner ? `(Owner: ${a.owner})` : ''} ${a.deadline ? `(Due: ${a.deadline})` : ''}`).join("\\n")}

### Open Questions
${result.openQuestions?.map((p: string) => "- " + p).join("\\n")}

### Follow-ups
${result.followUps?.map((p: string) => "- " + p).join("\\n")}
    `.trim();
    
    navigator.clipboard.writeText(text);
  };

  const handleSaveEdit = async () => {
    if (!generationId || !editedResult) return;
    try {
      await updateGeneration(generationId, { output: editedResult });
      setResult(editedResult);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save edit", err);
    }
  };

  const handleRegenerate = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/tools"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Meeting Summarizer</h1>
              <p className="text-muted-foreground text-sm">Convert chaotic meeting transcripts into structured summaries.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-200">
        {/* Form Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <form id="meeting-form" onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Meeting Title *</label>
                  <Input {...form.register("title")} placeholder="e.g. Q3 Roadmap Planning" className="bg-background" />
                  {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Date (Optional)</label>
                  <Input type="date" {...form.register("date")} className="bg-background" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Transcript or Notes *</label>
                <Textarea 
                  {...form.register("transcript")} 
                  placeholder="Paste the raw transcript or your messy notes here..." 
                  className="min-h-100 bg-background" 
                />
                {form.formState.errors.transcript && <p className="text-sm text-destructive mt-1">{form.formState.errors.transcript.message}</p>}
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
            <Button 
              type="submit" 
              form="meeting-form" 
              disabled={isGenerating} 
              className="w-full sm:w-auto min-w-30"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...</>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Result Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden bg-muted/10 relative">
          <CardHeader className="border-b pb-4 bg-background flex flex-row items-center justify-between sticky top-0 z-10">
            <CardTitle className="text-lg">Generated Summary</CardTitle>
            {result && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} /> 
                      {isFavorite ? 'Saved' : 'Favorite'}
                    </Button>
                    <Button variant="default" size="sm" onClick={handleRegenerate}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditedResult(result); // Revert
                      setIsEditing(false);
                    }}>
                      Cancel
                    </Button>
                    <Button variant="default" size="sm" onClick={handleSaveEdit}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto bg-muted/10">
            {!result && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 opacity-50" />
                </div>
                <p>Paste a transcript and click Generate to see the structured summary.</p>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center h-125 text-muted-foreground p-12">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
                <p className="animate-pulse">Analyzing meeting transcript...</p>
              </div>
            ) : result ? (
              <div className="p-6 space-y-8">
                {/* Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Summary</h3>
                  {isEditing ? (
                    <Textarea 
                      value={editedResult.summary}
                      onChange={(e) => setEditedResult({...editedResult, summary: e.target.value})}
                      className="min-h-25"
                    />
                  ) : (
                    <p className="text-foreground leading-relaxed">{result.summary}</p>
                  )}
                </div>

                {/* Key Points */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2">Key Points</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    {(isEditing ? editedResult.keyPoints : result.keyPoints)?.map((point: string, idx: number) => (
                      <li key={idx} className="text-foreground">
                        {isEditing ? (
                          <Input 
                            value={point}
                            onChange={(e) => {
                              const newPoints = [...editedResult.keyPoints];
                              newPoints[idx] = e.target.value;
                              setEditedResult({...editedResult, keyPoints: newPoints});
                            }}
                            className="h-8 mb-2"
                          />
                        ) : point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decisions */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 text-primary">Decisions Made</h3>
                  <ul className="space-y-2">
                    {(isEditing ? editedResult.decisions : result.decisions)?.map((decision: string, idx: number) => (
                      <li key={idx} className="flex items-start bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <CheckCircle className="h-5 w-5 mr-3 text-primary shrink-0 mt-0.5" />
                        {isEditing ? (
                          <Input 
                            value={decision}
                            onChange={(e) => {
                              const newDec = [...editedResult.decisions];
                              newDec[idx] = e.target.value;
                              setEditedResult({...editedResult, decisions: newDec});
                            }}
                            className="h-8 flex-1"
                          />
                        ) : (
                          <span className="text-foreground font-medium">{decision}</span>
                        )}
                      </li>
                    ))}
                    {(!result.decisions || result.decisions.length === 0) && (
                      <p className="text-muted-foreground text-sm italic">No major decisions recorded.</p>
                    )}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 text-amber-500">Action Items</h3>
                  <div className="grid gap-3">
                    {(isEditing ? editedResult.actionItems : result.actionItems)?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-background p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start flex-1">
                          <div className="h-5 w-5 rounded border border-input mr-3 mt-0.5 shrink-0" />
                          {isEditing ? (
                            <Input 
                              value={item.task}
                              onChange={(e) => {
                                const newItems = [...editedResult.actionItems];
                                newItems[idx].task = e.target.value;
                                setEditedResult({...editedResult, actionItems: newItems});
                              }}
                              className="h-8 flex-1"
                            />
                          ) : (
                            <span className="font-medium">{item.task}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:ml-8 pl-8 sm:pl-0">
                          {isEditing ? (
                            <>
                              <Input 
                                placeholder="Owner"
                                value={item.owner || ''}
                                onChange={(e) => {
                                  const newItems = [...editedResult.actionItems];
                                  newItems[idx].owner = e.target.value;
                                  setEditedResult({...editedResult, actionItems: newItems});
                                }}
                                className="h-8 w-24 text-xs"
                              />
                              <Input 
                                placeholder="Deadline"
                                value={item.deadline || ''}
                                onChange={(e) => {
                                  const newItems = [...editedResult.actionItems];
                                  newItems[idx].deadline = e.target.value;
                                  setEditedResult({...editedResult, actionItems: newItems});
                                }}
                                className="h-8 w-24 text-xs"
                              />
                            </>
                          ) : (
                            <>
                              {item.owner && <Badge variant="secondary">{item.owner}</Badge>}
                              {item.deadline && <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">{item.deadline}</Badge>}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!result.actionItems || result.actionItems.length === 0) && (
                      <p className="text-muted-foreground text-sm italic">No action items recorded.</p>
                    )}
                  </div>
                </div>

                {/* Open Questions & Follow-ups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">Open Questions</h3>
                    <ul className="space-y-2 list-disc pl-5 text-sm">
                      {(isEditing ? editedResult.openQuestions : result.openQuestions)?.map((point: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">
                          {isEditing ? (
                            <Input 
                              value={point}
                              onChange={(e) => {
                                const newPoints = [...editedResult.openQuestions];
                                newPoints[idx] = e.target.value;
                                setEditedResult({...editedResult, openQuestions: newPoints});
                              }}
                              className="h-8 mb-1"
                            />
                          ) : point}
                        </li>
                      ))}
                      {(!result.openQuestions || result.openQuestions.length === 0) && (
                        <span className="italic">None</span>
                      )}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">Follow-ups</h3>
                    <ul className="space-y-2 list-disc pl-5 text-sm">
                      {(isEditing ? editedResult.followUps : result.followUps)?.map((point: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">
                          {isEditing ? (
                            <Input 
                              value={point}
                              onChange={(e) => {
                                const newPoints = [...editedResult.followUps];
                                newPoints[idx] = e.target.value;
                                setEditedResult({...editedResult, followUps: newPoints});
                              }}
                              className="h-8 mb-1"
                            />
                          ) : point}
                        </li>
                      ))}
                      {(!result.followUps || result.followUps.length === 0) && (
                        <span className="italic">None</span>
                      )}
                    </ul>
                  </div>
                </div>

              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
