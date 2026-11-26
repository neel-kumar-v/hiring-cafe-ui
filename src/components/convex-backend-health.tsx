"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ConvexBackendHealthContextValue = {
  reportQueryError: (error: Error) => void;
  outageMessage: string | null;
  dismissOutage: () => void;
};

const ConvexBackendHealthContext = createContext<ConvexBackendHealthContextValue | null>(null);

function messageFromConvexError(error: Error): string | null {
  const text = error.message || "";
  if (text.includes("exceeded the free plan limits") || text.includes("deployments have been disabled") || text.includes("deployment has been disabled")) {
    return "Live data is paused: the Convex deployment is disabled (Free plan limit exceeded). Upgrade or reduce usage to turn prod and dev back on.";
  }
  if (text.includes("Server Error") || text.includes("ConvexError")) {
    return "Live data is temporarily unavailable (Convex backend error).";
  }
  if (text.includes("Failed to fetch") || text.includes("NetworkError")) {
    return "Live data is temporarily unavailable (network error connecting to Convex).";
  }
  return "Live data is temporarily unavailable (Convex error).";
}

export function ConvexBackendHealthProvider({ children, initialOutageMessage = null }: { children: ReactNode; initialOutageMessage?: string | null }) {
  const [outageMessage, setOutageMessage] = useState<string | null>(initialOutageMessage);
  const [dismissed, setDismissed] = useState(false);

  const reportQueryError = useCallback((error: Error) => {
    const next = messageFromConvexError(error);
    if (!next) {
      return;
    }
    setOutageMessage((prev) => prev ?? next);
  }, []);

  const dismissOutage = useCallback(() => {
    setDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      reportQueryError,
      outageMessage: dismissed ? null : outageMessage,
      dismissOutage,
    }),
    [reportQueryError, outageMessage, dismissed, dismissOutage]
  );

  return <ConvexBackendHealthContext.Provider value={value}>{children}</ConvexBackendHealthContext.Provider>;
}

export function useConvexBackendHealth() {
  const ctx = useContext(ConvexBackendHealthContext);
  if (!ctx) {
    throw new Error("useConvexBackendHealth must be used within ConvexBackendHealthProvider");
  }
  return ctx;
}
