"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toolsRegistry } from "@/lib/ai/registry";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  FileText, 
  Briefcase, 
  Globe, 
  Mail, 
  FileSignature, 
  GraduationCap, 
  BriefcaseBusiness, 
  Handshake, 
  CalendarDays, 
  Rocket, 
  Terminal, 
  Bug, 
  Users,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="mr-2 h-4 w-4" />,
  Briefcase: <Briefcase className="mr-2 h-4 w-4" />,
  Linkedin: <Globe className="mr-2 h-4 w-4" />,
  Mail: <Mail className="mr-2 h-4 w-4" />,
  FileSignature: <FileSignature className="mr-2 h-4 w-4" />,
  GraduationCap: <GraduationCap className="mr-2 h-4 w-4" />,
  BriefcaseBusiness: <BriefcaseBusiness className="mr-2 h-4 w-4" />,
  Handshake: <Handshake className="mr-2 h-4 w-4" />,
  CalendarDays: <CalendarDays className="mr-2 h-4 w-4" />,
  Rocket: <Rocket className="mr-2 h-4 w-4" />,
  Github: <Terminal className="mr-2 h-4 w-4" />,
  Bug: <Bug className="mr-2 h-4 w-4" />,
  Users: <Users className="mr-2 h-4 w-4" />,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    const customOpen = () => setOpen(true);
    
    document.addEventListener("keydown", down);
    window.addEventListener("open-command", customOpen);
    
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-command", customOpen);
    }
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const toolsList = Object.values(toolsRegistry);

  return (
    <>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] pointer-events-none">
         {/* Mobile search trigger can be added if needed, but we'll use a global button or standard header button for now */}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search tools..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/tools"))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Browse All Tools</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="AI Tools">
            {toolsList.map((tool) => (
              <CommandItem
                key={tool.id}
                onSelect={() => runCommand(() => router.push(`/tools/${tool.id}`))}
              >
                {iconMap[tool.icon] || <FileText className="mr-2 h-4 w-4" />}
                <span>{tool.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{tool.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default CommandPalette;
