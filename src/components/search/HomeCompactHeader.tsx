"use client";

import { cn } from "@/lib/utils";
import HomeSearchActions from "@/components/search/HomeSearchActions";

interface HomeCompactHeaderProps {
  className?: string;
}

/**
 * Mobile-only band under the home search field holding the filter pills.
 * Shown in both Talent Agent and Classic Search — switching modes does not hide filters.
 * The logo, theme toggle, and hamburger AvatarPill were removed — mobile
 * navigation lives in the fixed bottom tab bar (MobileTabBar) and its More drawer.
 */
export default function HomeCompactHeader({ className }: HomeCompactHeaderProps) {
  return (
    <div className={cn("bg-background px-4 pb-3", className)}>
      <HomeSearchActions />
    </div>
  );
}
