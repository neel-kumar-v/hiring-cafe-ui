"use client";

import Link from "next/link";
import { useConvexBackendHealth } from "@/components/convex-backend-health";
import { X } from "lucide-react";

export function ConvexOutageBanner() {
  const { outageMessage, dismissOutage } = useConvexBackendHealth();
  if (!outageMessage) {
    return null;
  }
  return (
    <div
      className="relative z-50 border-b border-amber-500/40 bg-amber-950/90 px-4 py-2 text-center text-sm text-amber-100 dark:border-amber-500/30 dark:bg-amber-950/80"
      role="status"
    >
      <div className="flex items-center justify-center gap-2 pr-8">
        <span>{outageMessage}</span>
        <Link className="font-medium underline underline-offset-2 hover:text-white" href="https://dashboard.convex.dev" rel="noopener noreferrer" target="_blank">
          Open Convex dashboard
        </Link>
      </div>
      <button
        type="button"
        onClick={dismissOutage}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-amber-300 hover:bg-amber-900/50 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ConvexOutageBanner;
