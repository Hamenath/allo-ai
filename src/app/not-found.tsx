import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, LayoutDashboard, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 text-center">
      <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
        <Sparkles className="h-10 w-10" />
      </div>
      
      <h1 className="text-6xl font-extrabold tracking-tight mb-2 text-white">404</h1>
      <h2 className="text-2xl font-bold tracking-tight mb-3 text-slate-200">Page not found</h2>
      
      <p className="text-sm text-slate-400 max-w-md mb-8">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved. Explore our suite of AI tools or return to your workspace.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button variant="default" className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
        </Link>

        <Link href="/tools">
          <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <Search className="mr-2 h-4 w-4" /> AI Tools
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-xs text-slate-500 font-mono">
        ALLO — All your AI tools. One simple workspace.
      </div>
    </div>
  );
}
