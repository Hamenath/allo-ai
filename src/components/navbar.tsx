"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-mono text-xl font-bold tracking-tight">ALLO</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/tools" className="transition-colors hover:text-foreground">Tools</Link>
            <Link href="/solutions" className="transition-colors hover:text-foreground">Solutions</Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
            <Link href="/resources" className="transition-colors hover:text-foreground">Resources</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard" className="hidden md:block">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>Menu</SheetTitle>
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/tools" className="text-sm font-medium">Tools</Link>
                <Link href="/solutions" className="text-sm font-medium">Solutions</Link>
                <Link href="/pricing" className="text-sm font-medium">Pricing</Link>
                <Link href="/resources" className="text-sm font-medium">Resources</Link>
                <div className="h-px bg-border my-2" />
                {!loading && (
                  user ? (
                    <>
                      <Link href="/dashboard" className="text-sm font-medium">Dashboard</Link>
                      <Button variant="outline" onClick={logout} className="justify-start mt-2">Log out</Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <Link href="/login">
                        <Button variant="outline" className="w-full justify-start">Log in</Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full justify-start">Get Started</Button>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
