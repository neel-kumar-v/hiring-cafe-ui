"use client";

import { Hitbox } from "@/components/ui/hitbox";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { Swap, SwapOff, SwapOn } from "./ui/swap";

/** Decorative moon/sun swap for menus; parent handles toggling `isDarkMode`. */
export function ThemeIconSwap({
  isDarkMode,
  className,
}: {
  isDarkMode: boolean;
  className?: string;
}) {
  return (
    <Swap
      animation="rotate"
      aria-hidden
      className={cn(
        "pointer-events-none relative size-4 shrink-0 cursor-default text-muted-foreground",
        className,
      )}
      role="none"
      swapped={isDarkMode}
      tabIndex={-1}
    >
      <SwapOff className="absolute inset-0 flex items-center justify-center transition-none">
        <Moon className="size-4" />
      </SwapOff>
      <SwapOn className="absolute inset-0 flex items-center justify-center text-foreground transition-none">
        <Sun className="size-4" />
      </SwapOn>
    </Swap>
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
      <Swap
        animation="rotate"
        aria-label={label}
        className="size-9 rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent dark:border-border dark:bg-card dark:hover:bg-accent"
        onSwappedChange={setIsDarkMode}
        swapped={isDarkMode}
        title={label}
      >
        <SwapOff className="absolute inset-0 flex items-center justify-center text-muted-foreground transition-none">
          <Moon className="size-4" />
        </SwapOff>
        <SwapOn className="absolute inset-0 flex items-center justify-center text-foreground transition-none">
          <Sun className="size-4" />
        </SwapOn>
      </Swap>
    </Hitbox>
  );
}
