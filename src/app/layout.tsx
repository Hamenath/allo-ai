import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-mono" });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alloai.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ALLO — All-in-One AI Workspace",
    template: "%s | ALLO",
  },
  description: "ALLO brings powerful AI tools for career, business, productivity, learning, and development into one simple workspace.",
  keywords: [
    "AI workspace",
    "AI tools",
    "resume analyzer",
    "interview practice",
    "meeting summarizer",
    "study planner",
    "invoice generator",
    "ALLO",
    "alloai"
  ],
  authors: [{ name: "ALLO Team" }],
  creator: "ALLO",
  publisher: "ALLO",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ALLO",
    title: "ALLO — All-in-One AI Workspace",
    description: "All your AI tools. One simple workspace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ALLO — All-in-One AI Workspace",
    description: "All your AI tools. One simple workspace.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ALLO",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.ico`,
  description: "All your AI tools. One simple workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
