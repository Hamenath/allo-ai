"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Briefcase, FileText, Code, ArrowRight, History, Zap, Users, GraduationCap, ChevronRight, File, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAIGenerations, AIGeneration } from "@/lib/db/generations";
import { getUsage, UsageInfo } from "@/lib/db/usage";
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
  const [favoriteDocs, setFavoriteDocs] = useState<AIGeneration[]>([]);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    async function loadRecentDocs() {
      if (!user) return;
      try {
        const { docs } = await getAIGenerations(user.uid, { limitCount: 4 });
        setRecentDocs(docs);
        
        const { docs: favs } = await getAIGenerations(user.uid, { isFavorite: true, limitCount: 4 });
        setFavoriteDocs(favs);

        const usageData = await getUsage(user.uid);
        setUsageInfo(usageData);
      } catch (err) {
        console.error("Failed to load dashboard docs", err);
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

      <div className="relative max-w-2xl group" onClick={() => window.dispatchEvent(new CustomEvent('open-command'))}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <div className="flex h-12 w-full items-center justify-between rounded-full border border-muted-foreground/20 bg-background px-4 py-2 pl-11 shadow-sm transition-colors hover:bg-muted/50 cursor-text">
          <span className="text-muted-foreground">Search tools or tell ALLO what you want to do...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
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
            <Card className="border-border/50 shadow-sm flex flex-col h-auto min-h-100">
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
            
            <Card className="border-border/50 shadow-sm flex flex-col h-auto">
              <CardHeader className="bg-muted/20 border-b py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center">
                    <Heart className="mr-2 h-4 w-4 text-rose-500" /> Favorites
                  </CardTitle>
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground text-xs">
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col">
                {loadingDocs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
                  </div>
                ) : favoriteDocs.length > 0 ? (
                  <div className="divide-y flex-1">
                    {favoriteDocs.map((doc) => (
                      <Link key={doc.id} href="/favorites" className="block hover:bg-muted/30 transition-colors p-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 overflow-hidden pr-2">
                            <p className="font-medium text-xs line-clamp-1 group-hover:text-primary transition-colors">{doc.title || "Untitled"}</p>
                            <span className="text-[10px] text-muted-foreground">{doc.toolId}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <Heart className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No favorites yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/20 border-b py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm flex items-center"><Sparkles className="mr-2 h-4 w-4 text-primary" /> AI Usage</CardTitle>
                <Badge variant="outline" className="text-[10px] font-normal">{usageInfo?.plan || "FREE"}</Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold">{usageInfo?.used ?? 0} <span className="text-sm font-normal text-muted-foreground">/ {usageInfo?.limit ?? 5}</span></span>
                  <span className="text-xs text-muted-foreground">{usageInfo?.remaining ?? 5} remaining</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      (usageInfo?.remaining ?? 5) <= 0 ? 'bg-destructive' : (usageInfo?.percentage ?? 0) >= 80 ? 'bg-amber-500' : 'bg-primary'
                    }`} 
                    style={{ width: `${usageInfo?.percentage ?? 0}%` }}
                  />
                </div>
                {((usageInfo?.remaining ?? 5) <= 1) && (
                  <p className="text-xs text-amber-500 font-medium pt-1">You&apos;re almost at your monthly limit.</p>
                )}
                <div className="pt-2 flex gap-2">
                  <Link href="/usage" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">View Usage</Button>
                  </Link>
                  <Link href="/billing" className="flex-1">
                    <Button variant={(usageInfo?.remaining ?? 5) <= 1 ? "default" : "secondary"} size="sm" className="w-full text-xs h-8">Upgrade</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
