import { Toaster } from "@/components/ui/sonner";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
// import { PerformanceMonitor } from "@/lib/performance-monitor";
import { AppProvider } from "@/contexts/AppContext";
import { SearchUIProvider } from "@/contexts/SearchContext";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Suspense, lazy } from "react";
import "./globals.css";

const Header = lazy(() => import("@/components/Header"));
const SearchDialogWrapper = lazy(() => import("@/components/SearchDialog").then(module => ({ default: module.SearchDialogWrapper })));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
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
  metadataBase: new URL("https://hiring-cafe-clone.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiring-cafe-clone.vercel.app",
    title: "Hiring Cafe Clone",
    description: "UI Redesign of the hiring.cafe website",
    siteName: "Hiring Cafe Clone",
    images: [
      {
        url: "/meta.png",
        width: 1200,
        height: 630,
        alt: "Hiring Cafe Clone - Job Board Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hiring Cafe Clone",
    description: "UI Redesign of the hiring.cafe website",
    images: ["/meta.png"],
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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
      <body
        className={`antialiased ${geistSans.variable} ${geistMono.variable} ${montserrat.variable}`}
      >
        <DarkModeProvider>
          <ConvexClientProvider>
            <Suspense fallback={null}>
              <AppProvider>
                <SearchUIProvider>
                  <div className="min-h-screen transition-colors duration-300">
                    <div className="min-h-screen bg-white dark:bg-neutral-900">
                      <Suspense fallback={null}>
                        <Header />
                      </Suspense>

                      <Suspense fallback={null}>
                        <SearchDialogWrapper />
                      </Suspense>

                      {children}
                    </div>
                  </div>
                </SearchUIProvider>
              </AppProvider>
            </Suspense>
          </ConvexClientProvider>
        </DarkModeProvider>
        <Toaster />
        {/* <PerformanceMonitorScript /> */}
      </body>
    </html>
  );
}

// function PerformanceMonitorScript() {
//   if (typeof window !== 'undefined') {
//     const monitor = PerformanceMonitor.getInstance();
//     monitor.startMonitoring();
    
//     window.addEventListener('load', () => {
//       setTimeout(() => {
//         monitor.logSummary();
//       }, 1000);
//     });
//   }
//   return null;
// }
