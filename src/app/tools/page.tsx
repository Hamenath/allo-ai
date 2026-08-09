"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Briefcase, FileText, Code, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const tools = [
  { id: "resume-analyzer", name: "Resume Analyzer", category: "Career", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Optimize your resume for ATS and specific jobs." },
  { id: "interview-generator", name: "Interview Generator", category: "Career", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Practice with AI-generated tailored interview questions." },
  { id: "cover-letter", name: "Cover Letter Generator", category: "Career", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Write customized cover letters instantly." },
  { id: "cold-email", name: "Cold Email Generator", category: "Career", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Generate high-converting cold outreach emails." },
  { id: "linkedin", name: "LinkedIn Post Generator", category: "Career", icon: Sparkles, color: "text-sky-500", bg: "bg-sky-500/10", desc: "Generate highly engaging LinkedIn posts and updates." },
  { id: "study-planner", name: "Study Planner", category: "Learning", icon: Code, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create personalized study plans and schedules." },
  { id: "invoice", name: "Invoice Generator", category: "Business", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", desc: "Create and manage professional invoices." },
  { id: "job-description", name: "Job Description Generator", category: "Business", icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10", desc: "Write clear, inclusive job descriptions." },
  { id: "crm", name: "Freelancer CRM", category: "Business", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-500/10", desc: "Manage clients, leads, and your deal pipeline." },
  { id: "proposal", name: "Proposal Generator", category: "Business", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", desc: "Draft structured and persuasive client proposals." },
  { id: "social-calendar", name: "Social Media Calendar", category: "Business", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", desc: "Generate a month of tailored social media posts." },
  { id: "startup-validator", name: "Startup Idea Validator", category: "Business", icon: Code, color: "text-rose-500", bg: "bg-rose-500/10", desc: "Get critical AI analysis on your startup idea." },
  { id: "github-readme", name: "GitHub README Generator", category: "Developer", icon: Code, color: "text-stone-500", bg: "bg-stone-500/10", desc: "Generate professional README.md for your projects." },
  { id: "bug-report", name: "Bug Report Generator", category: "Developer", icon: Code, color: "text-red-500", bg: "bg-red-500/10", desc: "Convert messy descriptions into structured bug reports." },
  { id: "meeting-summarizer", name: "Meeting Summarizer", category: "Productivity", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10", desc: "Convert chaotic meeting transcripts into structured summaries." },
];

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(tools.map(t => t.category)));

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 flex items-center text-sm transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">All Tools</h1>
          <p className="text-muted-foreground text-lg">Browse our complete directory of AI tools.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search all tools..." 
            className="pl-11 h-12 text-base rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.id}`}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className={`p-3 rounded-xl ${tool.bg}`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <Badge variant="secondary" className="font-normal text-xs">{tool.category}</Badge>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">{tool.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{tool.desc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filteredTools.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No tools found</p>
            <p className="mt-1">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
