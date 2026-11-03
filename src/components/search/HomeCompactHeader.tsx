"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { AvatarPill } from "@/components/shell/AvatarPill";
import ThemeToggle from "@/components/ThemeToggle";
import { Hitbox } from "@/components/ui/hitbox";
import { useSearchUI } from "@/contexts/SearchContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { cn } from "@/lib/utils";
import Link from "next/link";
import HomeSearchActions from "@/components/search/HomeSearchActions";

interface HomeCompactHeaderProps {
  className?: string;
}

export default function HomeCompactHeader({ className }: HomeCompactHeaderProps) {
  const { searchMode } = useSearchUI();
  const isFiltersOpen = searchMode !== "talent-agent";
  const { contentRef, containerProps } = useCollapsibleHeight(isFiltersOpen);

  return (
    <div className={cn("bg-background", className)}>
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3">
        <Hitbox size="default" radius="full">
          <Link href="/" aria-label="CloneCafe home" className="inline-flex min-w-0 items-center gap-2 rounded-full text-primary">
            <BrandLogo showWordmark wordmarkClassName="text-base" />
          </Link>
        </Hitbox>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AvatarPill />
        </div>
      </div>
      <div {...containerProps}>
        <div
          ref={contentRef}
          className={cn(
            "px-4 pb-3 transition-transform duration-300 ease-in-out motion-reduce:transition-none motion-reduce:transform-none",
            isFiltersOpen ? "translate-y-0" : "-translate-y-full"
          )}
          inert={!isFiltersOpen}
        >
          <HomeSearchActions />
        </div>
      </div>
    </div>
  );
}
