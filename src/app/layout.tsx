import { TooltipProvider } from "@/components/ui/motion/tooltip-animated";
import { Toaster } from "@/components/ui/sonner";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ReducedMotionProvider } from "@/contexts/ReducedMotionContext";
// import { PerformanceMonitor } from "@/lib/performance-monitor";
import { AppProvider } from "@/contexts/AppContext";
import { SearchUIProvider } from "@/contexts/SearchContext";
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
  description: "Hiring Cafe Clone",
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
          <ReducedMotionProvider>
            <TooltipProvider>
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
            </TooltipProvider>
          </ReducedMotionProvider>
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
