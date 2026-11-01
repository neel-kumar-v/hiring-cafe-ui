import { Toaster } from "@/components/ui/sonner";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { AppProvider } from "@/contexts/AppContext";
import { SearchUIProvider } from "@/contexts/SearchContext";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import AppShell from "@/components/shell/AppShell";
import { AgentationDev } from "@/components/dev/AgentationDev";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Suspense, lazy } from "react";
import "./globals.css";

const SearchDialogWrapper = lazy(() => import("@/components/SearchDialog").then((module) => ({ default: module.SearchDialogWrapper })));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hiring Cafe Clone",
  description: "UI Redesign of the hiring.cafe website",
  keywords: ["jobs", "careers", "hiring", "employment", "job board", "recruitment"],
  authors: [{ name: "Hiring Cafe Clone" }],
  creator: "Hiring Cafe Clone",
  publisher: "Hiring Cafe Clone",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://hiring-cafe-ui-neelkumarvs-projects.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiring-cafe-ui-neelkumarvs-projects.vercel.app",
    title: "Hiring Cafe Clone",
    description: "UI Redesign of the hiring.cafe website",
    siteName: "Hiring Cafe Clone",
  },
  twitter: {
    card: "summary",
    title: "Hiring Cafe Clone",
    description: "UI Redesign of the hiring.cafe website",
    creator: "@hiringcafeclone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: [{ url: "/window.svg", type: "image/svg+xml" }],
    shortcut: "/window.svg",
    apple: "/window.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased font-sans ${geistSans.variable} ${montserrat.variable} ${geistMono.variable}`}>
        <DarkModeProvider>
          <ConvexClientProvider>
            <Suspense fallback={null}>
              <AppProvider>
                <SearchUIProvider>
                  <div className="min-h-screen transition-colors duration-300">
                    <AppShell>
                      <Suspense fallback={null}>
                        <SearchDialogWrapper />
                      </Suspense>
                      {children}
                    </AppShell>
                  </div>
                </SearchUIProvider>
              </AppProvider>
            </Suspense>
          </ConvexClientProvider>
        </DarkModeProvider>
        <Toaster />
        {process.env.NODE_ENV === "development" && <AgentationDev />}
      </body>
    </html>
  );
}
