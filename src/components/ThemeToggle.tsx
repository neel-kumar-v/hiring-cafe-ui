"use client";

import { Hitbox } from "@/components/ui/hitbox";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

/** Decorative moon/sun for menus; parent handles toggling `isDarkMode`. */
export function ThemeIconSwap({ isDarkMode, className }: { isDarkMode: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-4 shrink-0 text-muted-foreground", className)}>
      <Moon className={cn("absolute inset-0 size-4 transition-opacity", isDarkMode ? "opacity-0" : "opacity-100")} />
      <Sun className={cn("absolute inset-0 size-4 text-foreground transition-opacity", isDarkMode ? "opacity-100" : "opacity-0")} />
    </span>
  );
}

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const nextMode = isDarkMode ? "light" : "dark";
  const label = `Switch to ${nextMode} mode`;

  return (
    <Hitbox size="sm" radius="full" className={cn("shrink-0", className)}>
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="relative flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent dark:border-border dark:bg-card dark:hover:bg-accent"
      >
        <Moon className={cn("absolute size-4 transition-opacity", isDarkMode ? "opacity-0" : "opacity-100")} />
        <Sun className={cn("absolute size-4 text-foreground transition-opacity", isDarkMode ? "opacity-100" : "opacity-0")} />
      </button>
    </Hitbox>
  );
}
