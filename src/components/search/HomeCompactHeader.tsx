"use client";

import { BrandLogo } from "@/components/BrandLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { Hitbox } from "@/components/ui/hitbox";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HomeCompactHeaderProps {
  className?: string;
}

export default function HomeCompactHeader({ className }: HomeCompactHeaderProps) {
  return (
    <div className={cn("bg-background", className)}>
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3">
        <Hitbox size="default" radius="full">
          <Link href="/" aria-label="CloneCafe home" className="inline-flex min-w-0 items-center gap-2 rounded-full text-primary">
            <BrandLogo showWordmark wordmarkClassName="text-base" />
          </Link>
        </Hitbox>

        <ThemeToggle />
      </div>
    </div>
  );
}
