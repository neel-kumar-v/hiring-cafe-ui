"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in environment.");
}

const client = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

