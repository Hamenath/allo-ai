"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Asynchronously trigger welcome notification and email idempotently
      setTimeout(async () => {
        try {
          const { createNotificationIdempotent } = await import("@/lib/db/notifications");
          const { sendTransactionalEmail } = await import("@/lib/email/provider");
          const { getWelcomeEmailTemplate } = await import("@/lib/email/templates");

          const uid = userCredential.user.uid;
          const key = `${uid}_welcome`;

          await createNotificationIdempotent(uid, key, {
            type: "welcome",
            title: "Welcome to ALLO AI Workspace!",
            message: "Explore 15+ AI tools across Career, Business, Developer, and Learning. You get 5 complimentary generations every month.",
            link: "/dashboard",
          });

          const template = getWelcomeEmailTemplate(name);
          await sendTransactionalEmail({
            to: email,
            ...template,
            idempotencyKey: key,
          });
        } catch (err) {
          console.error("Error triggering welcome actions:", err);
        }
      }, 100);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2">
        <span className="font-mono text-xl font-bold tracking-tight">ALLO</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with ALLO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-1">
              By creating an account, you agree to our{" "}
              <Link href="/terms" target="_blank" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and acknowledge our{" "}
              <Link href="/privacy" target="_blank" className="underline hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
