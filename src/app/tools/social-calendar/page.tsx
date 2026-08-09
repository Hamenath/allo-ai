"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SocialCalendarInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, ArrowLeft, AlertCircle, Heart, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function SocialCalendarPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof SocialCalendarInputSchema>>({
    resolver: zodResolver(SocialCalendarInputSchema),
    defaultValues: {
      business: "",
      industry: "",
      audience: "",
      platform: "LinkedIn",
      goal: "",
      postingFrequency: "3 times a week",
      dateRange: "1 Week",
      tone: "Professional",
    },
  });

  async function onSubmit(data: z.infer<typeof SocialCalendarInputSchema>) {
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
          toolId: "social-calendar",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate social calendar");
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

  const copyPost = (post: any) => {
    const text = `${post.hook}\n\n${post.caption}\n\n${post.cta}\n\n${post.hashtags.map((h: string) => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(text);
    alert("Post copied to clipboard!");
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Generate a full month or week of structured social media posts instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                Strategy Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business / Brand Name *</label>
                  <Input placeholder="Acme Corp" {...form.register("business")} disabled={isGenerating} />
                  {form.formState.errors.business && <p className="text-xs text-destructive">{form.formState.errors.business.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry *</label>
                  <Input placeholder="e.g., SaaS, Retail, Fitness" {...form.register("industry")} disabled={isGenerating} />
                  {form.formState.errors.industry && <p className="text-xs text-destructive">{form.formState.errors.industry.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform</label>
                  <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("platform", val)} defaultValue={form.getValues("platform")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="X/Twitter">X/Twitter</SelectItem>
                      <SelectItem value="Mixed">Mixed Platforms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Goal *</label>
                  <Input placeholder="e.g., Brand awareness, Lead generation" {...form.register("goal")} disabled={isGenerating} />
                  {form.formState.errors.goal && <p className="text-xs text-destructive">{form.formState.errors.goal.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input placeholder="e.g., Small business owners" {...form.register("audience")} disabled={isGenerating} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("postingFrequency", val)} defaultValue={form.getValues("postingFrequency")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 time a week">1x / week</SelectItem>
                        <SelectItem value="3 times a week">3x / week</SelectItem>
                        <SelectItem value="5 times a week">5x / week</SelectItem>
                        <SelectItem value="Everyday">Everyday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("dateRange", val)} defaultValue={form.getValues("dateRange")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Week">1 Week</SelectItem>
                        <SelectItem value="2 Weeks">2 Weeks</SelectItem>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone of Voice</label>
                  <Input placeholder="e.g., Educational, Humorous, Professional" {...form.register("tone")} disabled={isGenerating} />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Create Calendar</>
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
        <div className="lg:col-span-8 xl:col-span-8">
          {!result && !isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-dashed border-border/50 text-center shadow-none p-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <CalendarDays className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Generate a Content Calendar</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Define your brand and goals to generate a ready-to-use social media schedule.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Creating Calendar...</h3>
              <p className="text-muted-foreground mt-2">Brainstorming topics and writing captions...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Content Calendar for {form.getValues("business")}</CardTitle>
                  <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto bg-muted/10">
                
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-6">
                  <h3 className="text-sm font-semibold text-primary mb-1 flex items-center"><CheckCircle2 className="mr-2 h-4 w-4" /> Strategy Summary</h3>
                  <p className="text-sm text-foreground">{result.strategySummary}</p>
                </div>

                <div className="space-y-6">
                  {result.calendar.map((post: any, index: number) => (
                    <Card key={index} className="shadow-sm overflow-hidden">
                      <div className="bg-muted px-4 py-2 border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">{post.dayOrDate}</span>
                          <span className="bg-background px-2 py-0.5 rounded text-xs border">{post.platform}</span>
                          <span className="text-xs text-muted-foreground capitalize">{post.contentType}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => copyPost(post)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy Post
                        </Button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Topic</p>
                          <p className="text-sm font-medium">{post.topic}</p>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md border whitespace-pre-wrap text-sm">
                          <p className="font-semibold mb-2">{post.hook}</p>
                          <p>{post.caption}</p>
                          <p className="font-medium mt-2">{post.cta}</p>
                          <p className="text-primary mt-3 text-xs">
                            {post.hashtags.map((h: string) => `#${h}`).join(" ")}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
