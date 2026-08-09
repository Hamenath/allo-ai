"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GithubReadmeInputSchema } from "@/lib/ai/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, GitBranch, ArrowLeft, AlertCircle, Heart, RefreshCw, Copy, Download } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { toggleFavorite } from "@/lib/db/generations";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GithubReadmePage() {
  const [result, setResult] = useState<any>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const form = useForm<z.infer<typeof GithubReadmeInputSchema>>({
    resolver: zodResolver(GithubReadmeInputSchema),
    defaultValues: {
      projectName: "",
      description: "",
      projectType: "",
      techStack: "",
      features: "",
      installation: "",
      usage: "",
      envVars: "",
      apiInfo: "",
      deployment: "",
      contribution: "",
      license: "",
    },
  });

  async function onSubmit(data: z.infer<typeof GithubReadmeInputSchema>) {
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
          toolId: "github-readme",
          input: data,
        }),
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error?.message || "Failed to generate README");
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
    if (!result?.markdown) return;
    navigator.clipboard.writeText(result.markdown);
  };

  const downloadMarkdown = () => {
    if (!result?.markdown) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/tools"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <GitBranch className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GitHub README Generator</h1>
            <p className="text-muted-foreground">Generate a professional, structured README.md for your open source or private project.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] min-h-200">
        {/* Form Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Project Name *</label>
                  <Input {...form.register("projectName")} placeholder="e.g. ALLO AI Engine" className="bg-background" />
                  {form.formState.errors.projectName && <p className="text-sm text-destructive mt-1">{form.formState.errors.projectName.message}</p>}
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Short Description *</label>
                  <Textarea 
                    {...form.register("description")} 
                    placeholder="Briefly describe what your project does and why it exists..." 
                    className="min-h-20 bg-background" 
                  />
                  {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Project Type</label>
                    <Input {...form.register("projectType")} placeholder="e.g. Web App, API, CLI" className="bg-background" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">License</label>
                    <Input {...form.register("license")} placeholder="e.g. MIT, Apache 2.0" className="bg-background" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tech Stack</label>
                  <Input {...form.register("techStack")} placeholder="e.g. React, Next.js, TailwindCSS, Firebase" className="bg-background" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Main Features</label>
                  <Textarea {...form.register("features")} placeholder="List key features (comma separated or bullet points)..." className="min-h-20 bg-background" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Installation Steps</label>
                  <Textarea {...form.register("installation")} placeholder="e.g. npm install, docker-compose up..." className="min-h-20 bg-background" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Usage</label>
                  <Textarea {...form.register("usage")} placeholder="How to use the project after installing..." className="min-h-20 bg-background" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Environment Variables</label>
                  <Textarea {...form.register("envVars")} placeholder="List required .env variables..." className="min-h-15 bg-background" />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-md" disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating README...</>
                ) : (
                  "Generate README.md"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Column */}
        <Card className="flex flex-col h-full border-border/50 shadow-sm overflow-hidden bg-muted/10">
          {!result && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full">
              <div className="bg-muted p-4 rounded-full mb-4">
                <GitBranch className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="font-medium text-lg mb-2 text-foreground">No README Generated</h3>
              <p className="max-w-md">Fill out the project details on the left and click generate to create a professional Markdown README file.</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground h-full space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="animate-pulse font-medium">Crafting perfect markdown...</p>
            </div>
          )}

          {result && !isGenerating && (
            <>
              <CardHeader className="bg-background border-b py-3 px-6 shrink-0 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center">
                  <span className="bg-primary/10 text-primary p-1.5 rounded mr-2">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  Generated README.md
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={downloadMarkdown} title="Download .md file">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard} title="Copy to clipboard">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={handleFavorite}>
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => form.handleSubmit(onSubmit)()} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full">
                  <div className="bg-muted/50 border-b px-6 py-2 shrink-0">
                    <TabsList className="grid w-full grid-cols-2 max-w-100">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="raw">Raw Markdown</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="flex-1 overflow-auto bg-background p-6">
                    <TabsContent value="preview" className="m-0 h-full outline-none">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {result.markdown}
                        </ReactMarkdown>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="raw" className="m-0 h-full outline-none">
                      <pre className="p-4 bg-muted/30 rounded-lg text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                        {result.markdown}
                      </pre>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
