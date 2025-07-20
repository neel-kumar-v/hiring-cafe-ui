import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ReducedMotionProvider } from "@/contexts/ReducedMotionContext";
// import { PerformanceMonitor } from "@/lib/performance-monitor";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DarkModeProvider>
          <ReducedMotionProvider>
            <TooltipProvider>{children}</TooltipProvider>
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
