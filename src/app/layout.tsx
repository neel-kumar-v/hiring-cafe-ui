import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip-animated";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { ReducedMotionProvider } from "@/contexts/ReducedMotionContext";
// import { PerformanceMonitor } from "@/lib/performance-monitor";
import type { Metadata } from "next";
import "./globals.css";



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
        className={`antialiased`}
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
