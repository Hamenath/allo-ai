import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Briefcase, Code, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
          <div className="container px-4 md:px-8 mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Meet the all-in-one workspace
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
              Everything you need. <br className="hidden md:inline" />
              <span className="text-muted-foreground">One place.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
              ALLO brings powerful AI tools for work, career, business, development, and everyday productivity into one simple workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Explore Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories / Tools Overview */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">One workspace for every task</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stop jumping between dozens of AI tools. ALLO integrates the most powerful capabilities into four core pillars.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Career", icon: Briefcase, desc: "Resume analysis, cover letters, and interview prep." },
                { title: "Business", icon: FileText, desc: "Proposals, invoices, CRM, and idea validation." },
                { title: "Developer", icon: Code, desc: "README generators, bug reports, and more." },
                { title: "Productivity", icon: Sparkles, desc: "Meeting summaries, planners, and organization." },
              ].map((category) => (
                <div key={category.title} className="p-6 rounded-2xl bg-background border shadow-sm transition-all hover:shadow-md">
                  <category.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">{category.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How ALLO Works */}
        <section className="py-24">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                  Simple, intuitive, and fast
                </h2>
                <div className="space-y-8">
                  {[
                    { step: "1", title: "Choose a tool", desc: "Select from our library of specialized AI tools designed for specific tasks." },
                    { step: "2", title: "Provide context", desc: "Fill in the required information. The more context you provide, the better the result." },
                    { step: "3", title: "Get professional results", desc: "Our AI generates high-quality output that you can save, edit, and use immediately." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-auto lg:h-150 rounded-2xl border bg-muted/30 overflow-hidden p-8 flex flex-col justify-center gap-4">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/5 via-primary/5 to-transparent"></div>
                <div className="relative grid grid-cols-2 gap-3">
                  {["Resume Analyzer", "Cover Letter", "LinkedIn Post", "GitHub README", "Startup Validator", "Meeting Summarizer"].map((tool) => (
                    <div key={tool} className="flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur border px-3 py-2.5 text-sm font-medium shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 border-t">
          <div className="container px-4 md:px-8 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to simplify your workflow?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop switching between apps. Get everything done in one AI workspace — built for career, business, development, and productivity.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
