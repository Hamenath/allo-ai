"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Briefcase, FileText, Code, ArrowRight, History, Zap, Users, GraduationCap, ChevronRight, File } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAIGenerations, AIGeneration } from "@/lib/db/generations";
import { format } from "date-fns";

const tools = [
  { id: "resume-analyzer", name: "Resume Analyzer", category: "Career", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Optimize your resume for ATS and specific jobs." },
  { id: "interview-generator", name: "Interview Generator", category: "Career", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Practice with AI-generated tailored interview questions." },
  { id: "cover-letter", name: "Cover Letter Generator", category: "Career", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Write customized cover letters instantly." },
  { id: "cold-email", name: "Cold Email Generator", category: "Career", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Generate high-converting cold outreach emails." },
  { id: "linkedin", name: "LinkedIn Post Generator", category: "Career", icon: Sparkles, color: "text-sky-500", bg: "bg-sky-500/10", desc: "Generate highly engaging LinkedIn posts and updates." },
  { id: "study-planner", name: "Study Planner", category: "Learning", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create personalized study plans and schedules." },
  { id: "invoice", name: "Invoice Generator", category: "Business", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create and manage professional invoices." },
  { id: "job-description", name: "Job Description Generator", category: "Business", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Write clear, inclusive job descriptions." },
  { id: "crm", name: "Freelancer CRM", category: "Business", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Manage clients, leads, and your deal pipeline." },
  { id: "proposal", name: "Proposal Generator", category: "Business", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Draft structured and persuasive client proposals." },
  { id: "social-calendar", name: "Social Media Calendar", category: "Business", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Generate a month of tailored social media posts." },
  { id: "startup-validator", name: "Startup Idea Validator", category: "Business", icon: Code, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Get critical AI analysis on your startup idea." },
  { id: "github-readme", name: "GitHub README Generator", category: "Developer", icon: Code, color: "text-stone-500", bg: "bg-stone-500/10", desc: "Generate professional README.md for your projects." },
  { id: "bug-report", name: "Bug Report Generator", category: "Developer", icon: Code, color: "text-red-500", bg: "bg-red-500/10", desc: "Convert messy descriptions into structured bug reports." },
  { id: "meeting-summarizer", name: "Meeting Summarizer", category: "Productivity", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Convert chaotic meeting transcripts into structured summaries." },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentDocs, setRecentDocs] = useState<AIGeneration[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    async function loadRecentDocs() {
      if (!user) return;
      try {
        const { docs } = await getAIGenerations(user.uid, { limitCount: 4 });
        setRecentDocs(docs);
      } catch (err) {
        console.error("Failed to load recent docs", err);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadRecentDocs();
  }, [user]);

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good morning, {user?.displayName?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-muted-foreground text-lg">What would you like to get done today?</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search for tools... (e.g., Summarize meeting, Write a proposal)" 
          className="pl-11 h-12 text-base rounded-full shadow-sm bg-background border-muted-foreground/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Area: Tools */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Quick Actions / Featured */}
          {!searchQuery && (
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-amber-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tools.filter(t => ["meeting-summarizer", "study-planner", "proposal"].includes(t.id)).map(tool => (
                  <Link key={tool.id} href={`/tools/${tool.id}`}>
                    <Card className="h-full hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className={`p-3 rounded-full ${tool.bg} mb-3`}>
                          <tool.icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{tool.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">
                {searchQuery ? "Search Results" : "All Tools"}
              </h2>
              {!searchQuery && (
                <Link href="/tools">
                  <Button variant="link" className="text-muted-foreground">View all <ArrowRight className="ml-1 h-4 w-4" /></Button>
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool) => (
                <Link key={tool.id} href={`/tools/${tool.id}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div className={`p-2.5 rounded-xl ${tool.bg}`}>
                        <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      </div>
                      <Badge variant="secondary" className="font-normal text-xs">{tool.category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-base mb-1 group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">{tool.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {filteredTools.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-background rounded-xl border border-dashed">
                  No tools found matching &quot;{searchQuery}&quot;. Try a different search term.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Documents & Usage */}
        {!searchQuery && (
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm flex flex-col h-auto min-h-[400px]">
              <CardHeader className="bg-muted/20 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <File className="mr-2 h-5 w-5" /> Recent Documents
                  </CardTitle>
                  <Link href="/documents">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground text-xs">
                      View all <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                {loadingDocs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentDocs.length > 0 ? (
                  <div className="divide-y flex-1">
                    {recentDocs.map((doc) => (
                      <Link key={doc.id} href="/documents" className="block hover:bg-muted/30 transition-colors p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 overflow-hidden pr-2">
                            <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{doc.title || "Untitled"}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px] px-1.5">{doc.category}</Badge>
                              <span className="text-xs text-muted-foreground truncate">{doc.toolId}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {doc.createdAt?.toDate ? format(doc.createdAt.toDate(), 'MMM d') : 'New'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4 flex-1">
                    <History className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No recent documents</p>
                    <p className="text-xs text-muted-foreground mt-1">Your generated content will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b py-3">
                <CardTitle className="text-sm flex items-center"><Sparkles className="mr-2 h-4 w-4" /> Usage Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Generations</span>
                  <span className="text-sm text-muted-foreground">Unlimited / Free</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/20 w-full rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/40 shimmer-effect"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
