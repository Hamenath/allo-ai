"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LinkedinGeneratorInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, ArrowLeft, AlertCircle, Copy, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";

export default function LinkedinGeneratorPage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof LinkedinGeneratorInputSchema>>({
    resolver: zodResolver(LinkedinGeneratorInputSchema),
    defaultValues: {
      topic: "",
      audience: "",
      goal: "",
      tone: "Professional",
      postType: "Career update",
    },
  });

  async function onSubmit(data: z.infer<typeof LinkedinGeneratorInputSchema>) {
    setIsGenerating(true);
    setError(null);
    setCopiedIndex(null);
    
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
          toolId: "linkedin-generator",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate post");
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Post Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create highly engaging, readable LinkedIn posts that capture attention and drive your professional goals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                Post Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic or Update</label>
                  <Textarea 
                    placeholder="e.g., I just finished a machine learning bootcamp and built a real-time face recognition app..." 
                    className="h-24 resize-none" 
                    {...form.register("topic")} 
                    disabled={isGenerating} 
                  />
                  {form.formState.errors.topic && <p className="text-xs text-destructive">{form.formState.errors.topic.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input placeholder="e.g., Recruiters, Tech Founders, Junior Devs" {...form.register("audience")} disabled={isGenerating} />
                  {form.formState.errors.audience && <p className="text-xs text-destructive">{form.formState.errors.audience.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal of Post</label>
                  <Input placeholder="e.g., Get job interviews, share knowledge" {...form.register("goal")} disabled={isGenerating} />
                  {form.formState.errors.goal && <p className="text-xs text-destructive">{form.formState.errors.goal.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tone</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("tone", val)} defaultValue={form.getValues("tone")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Friendly">Friendly</SelectItem>
                        <SelectItem value="Storytelling">Storytelling</SelectItem>
                        <SelectItem value="Thought leadership">Thought Leadership</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post Type</label>
                    <Select disabled={isGenerating} onValueChange={(val: any) => form.setValue("postType", val)} defaultValue={form.getValues("postType")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Career update">Career Update</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Personal story">Personal Story</SelectItem>
                        <SelectItem value="Hiring">Hiring</SelectItem>
                        <SelectItem value="Product announcement">Product Announcement</SelectItem>
                        <SelectItem value="Achievement">Achievement</SelectItem>
                        <SelectItem value="Industry insight">Industry Insight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Generate Variations</>
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
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Post Generated</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Fill out your topic and goals to get 3 optimized variations for your next LinkedIn post.
              </p>
            </Card>
          ) : isGenerating ? (
            <Card className="flex h-full min-h-125 flex-col items-center justify-center border-border/50 shadow-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-xl font-medium">Crafting your post...</h3>
              <p className="text-muted-foreground mt-2">Writing engaging hooks and formatting for readability...</p>
            </Card>
          ) : result ? (
            <Card className="h-full border-border/50 shadow-sm flex flex-col">
              <CardHeader className="border-b pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Post Variations</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} /> Favorite
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <Tabs defaultValue="var-0" className="w-full">
                  <TabsList className="mb-6 grid w-full grid-cols-3">
                    <TabsTrigger value="var-0">Variation 1</TabsTrigger>
                    <TabsTrigger value="var-1">Variation 2</TabsTrigger>
                    <TabsTrigger value="var-2">Variation 3</TabsTrigger>
                  </TabsList>
                  
                  {result.variations.map((post: any, idx: number) => {
                    const fullText = `${post.hook}\n\n${post.mainContent}\n\n${post.cta}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`;
                    
                    return (
                      <TabsContent key={idx} value={`var-${idx}`}>
                        <div className="bg-muted/30 rounded-lg p-6 border relative group">
                          <div className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">
                            <p className="font-semibold">{post.hook}</p>
                            <br />
                            <p>{post.mainContent}</p>
                            <br />
                            <p className="font-medium">{post.cta}</p>
                            <br />
                            <p className="text-muted-foreground text-sm">
                              {post.hashtags.map((h: string) => `#${h}`).join(' ')}
                            </p>
                          </div>
                          
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="shadow-sm"
                              onClick={() => copyToClipboard(fullText, idx)}
                            >
                              {copiedIndex === idx ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                              {copiedIndex === idx ? "Copied" : "Copy Post"}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Length: {fullText.length} characters</span>
                          <span>Optimized for readability</span>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
