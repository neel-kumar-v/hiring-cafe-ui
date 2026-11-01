"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

/**
 * Avatar pill from the navbar (shared with chat panel header).
 * The menu options have been migrated into AppSidebar above Talent Agent
 * and Classic Searches (Feedback #12). The old menu is emptied/removed.
 * Note: Feedback #19 removes the three-bars button entirely once options moved.
 */
export function AvatarPill({ className }: { className?: string }) {
  return (
    <Button
      className={cn("flex h-9 items-center gap-2 rounded-full border border-border bg-background py-0 pl-3 pr-1.5 shadow-sm hover:bg-accent", className)}
      variant="outline"
      aria-label="Account"
    >
      <Menu className="size-4 text-foreground" />
      <span className="size-6 rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-primary" aria-hidden />
    </Button>
  );
}

/** Slim mobile top bar for routes that don't have their own mobile band (everything except home). */
export function MobileTopBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="flex items-center justify-between border-b border-border bg-background-header px-4 py-2.5 md:hidden dark:bg-background">
      <div className="flex items-center gap-2">
        <BrandLogo />
        <span className="font-bold text-primary text-lg">CloneCafe</span>
      </div>
      <AvatarPill />
    </div>
  );
}
