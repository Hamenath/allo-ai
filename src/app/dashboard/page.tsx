"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Briefcase, FileText, Code, ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  { id: "resume-analyzer", name: "Resume Analyzer", category: "Career", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Optimize your resume for ATS and specific jobs." },
  { id: "interview-generator", name: "Interview Generator", category: "Career", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Practice with AI-generated tailored interview questions." },
  { id: "cover-letter", name: "Cover Letter Generator", category: "Career", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Write customized cover letters instantly." },
  { id: "cold-email", name: "Cold Email Generator", category: "Career", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Generate high-converting cold outreach emails." },
  { id: "linkedin", name: "LinkedIn Post Generator", category: "Career", icon: Sparkles, color: "text-sky-500", bg: "bg-sky-500/10", desc: "Generate highly engaging LinkedIn posts and updates." },
  { id: "study-planner", name: "Study Planner", category: "Career", icon: Code, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create personalized study plans and schedules." },
  { id: "invoice", name: "Invoice Generator", category: "Business", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create and manage professional invoices." },
  { id: "job-description", name: "Job Description Generator", category: "Business", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Write clear, inclusive job descriptions." },
  { id: "crm", name: "Freelancer CRM", category: "Business", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Manage clients, leads, and your deal pipeline." },
  { id: "proposal", name: "Proposal Generator", category: "Business", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Draft structured and persuasive client proposals." },
  { id: "social-calendar", name: "Social Media Calendar", category: "Business", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Generate a month of tailored social media posts." },
  { id: "startup-validator", name: "Startup Idea Validator", category: "Business", icon: Code, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Get critical AI analysis on your startup idea." },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good morning, {user?.displayName?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-muted-foreground text-lg">What would you like to get done today?</p>
      </div>

      <div className="relative max-w-2xl">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="What do you want to do? (e.g., Analyze my resume, Write a proposal)" 
          className="pl-11 h-12 text-base rounded-full shadow-sm bg-background border-muted-foreground/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {searchQuery ? "Search Results" : "Popular Tools"}
          </h2>
          {!searchQuery && (
            <Link href="/tools">
              <Button variant="link" className="text-muted-foreground">View all <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      
      {!searchQuery && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><History className="mr-2 h-5 w-5" /> Recent Activity</CardTitle>
              <CardDescription>Your latest AI generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground py-4 text-center">
                You haven&apos;t used any tools yet. Try generating something!
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center"><Sparkles className="mr-2 h-5 w-5" /> Usage Limit</CardTitle>
              <CardDescription>Free Plan (0 / 5 used)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary w-0 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 generations</span>
                <span>5 limit</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
