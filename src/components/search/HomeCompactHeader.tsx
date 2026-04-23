"use client";

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
            <div className="w-fit rounded-full bg-primary p-2 text-primary-foreground">
              <svg
                aria-hidden="true"
                className="h-5 w-5 flex-none"
                data-slot="icon"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="min-w-0 truncate font-bold text-base text-primary">CloneCafe</span>
          </Link>
        </Hitbox>

        <ThemeToggle />
      </div>
    </div>
  );
}
