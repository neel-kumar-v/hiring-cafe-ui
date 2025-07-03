"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (reducedMotion: boolean) => void;
  toggleReducedMotion: () => void;
}

const ReducedMotionContext = createContext<
  ReducedMotionContextType | undefined
>(undefined);

export function ReducedMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Initialize reduced motion preference from localStorage and system preference on mount
  useEffect(() => {
    const savedReducedMotion = localStorage.getItem("reducedMotion");
    const systemPrefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (savedReducedMotion !== null) {
      setPrefersReducedMotion(JSON.parse(savedReducedMotion));
    } else {
      setPrefersReducedMotion(systemPrefersReducedMotion);
    }
  }, []);

  // Update localStorage when reduced motion preference changes
  useEffect(() => {
    localStorage.setItem("reducedMotion", JSON.stringify(prefersReducedMotion));
  }, [prefersReducedMotion]);

  const toggleReducedMotion = () => {
    setPrefersReducedMotion((prev) => !prev);
  };

  return (
    <ReducedMotionContext.Provider
      value={{
        prefersReducedMotion,
        setPrefersReducedMotion,
        toggleReducedMotion,
      }}
    >
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion() {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    throw new Error(
      "useReducedMotion must be used within a ReducedMotionProvider"
    );
  }
  return context;
}
