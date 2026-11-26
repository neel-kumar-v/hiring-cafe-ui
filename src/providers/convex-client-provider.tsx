"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";
import { ConvexBackendHealthProvider } from "@/components/convex-backend-health";

// Fallback dummy URL when NEXT_PUBLIC_CONVEX_URL is not set so ConvexProvider
// can mount without crashing the root layout and child hooks continue to function.
const FALLBACK_CONVEX_URL = "https://disabled.convex.cloud";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const isConfigured = Boolean(convexUrl);

  const client = useMemo(() => {
    return new ConvexReactClient(convexUrl || FALLBACK_CONVEX_URL);
  }, [convexUrl]);

  const initialOutageMessage = isConfigured ? null : "Live data is unavailable: NEXT_PUBLIC_CONVEX_URL is not configured in environment.";

  return (
    <ConvexBackendHealthProvider initialOutageMessage={initialOutageMessage}>
      <ConvexProvider client={client}>{children}</ConvexProvider>
    </ConvexBackendHealthProvider>
  );
}
