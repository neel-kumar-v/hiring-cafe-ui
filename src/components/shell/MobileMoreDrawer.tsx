"use client";

import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { useDarkMode, type ThemeMode } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, Building2, Coffee, ExternalLink, HandCoins, Info, LayoutGrid, MessageCircle, Monitor, Moon, Plus, Search, Sun, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Row hrefs reused from existing destinations only — no invented pages. */
const EMPLOYERS_HREF = "https://tally.so/r/n9rv4p"; // Same external form AppSidebar uses for Employers.
const REDDIT_HREF = "https://reddit.com/r/hiringcafe";

const rowClass =
  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function RowIcon({ icon: Icon }: { icon: typeof Search }) {
  return <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />;
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{children}</div>;
}

const THEME_OPTIONS: readonly SlidingTabOption<ThemeMode>[] = [
  { id: "light", label: "Light", icon: <Sun className="size-4" />, ariaLabel: "Light theme" },
  { id: "dark", label: "Dark", icon: <Moon className="size-4" />, ariaLabel: "Dark theme" },
  { id: "system", label: "System", icon: <Monitor className="size-4" />, ariaLabel: "Follow system theme" },
];

/**
 * Mobile "More" menu drawer (opened from the bottom tab bar), mirroring the
 * hiring.cafe menu. Real links navigate and close the drawer; rows without a
 * real destination are no-op buttons. Closed via scrim or drag handle.
 */
export default function MobileMoreDrawer({ open, onOpenChange }: MobileMoreDrawerProps) {
  const { theme, setTheme } = useDarkMode();
  const close = () => onOpenChange(false);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="w-full max-w-full rounded-t-xl" aria-describedby={undefined}>
        <DrawerTitle className="sr-only">More menu</DrawerTitle>

        <nav aria-label="More menu" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 pt-2">
          <Link href="/" onClick={close} className={rowClass}>
            <RowIcon icon={Search} />
            Search
          </Link>
          <Link href="/tracker" onClick={close} className={rowClass}>
            <RowIcon icon={BarChart3} />
            Job tracker
          </Link>
          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={LayoutGrid} />
            Boards
          </button>
          <Link href="/talent-network" onClick={close} className={rowClass}>
            <RowIcon icon={Users} />
            Talent Network
          </Link>

          <SectionLabel>HiringCafe</SectionLabel>

          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={Coffee} />
            Espresso Club
          </button>
          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={HandCoins} />
            Tip Jar
          </button>
          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={Info} />
            About HiringCafe
          </button>
          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={Briefcase} />
            Careers
            <Badge variant="secondary" className="ml-auto shrink-0">
              We&apos;re hiring!
            </Badge>
          </button>
          <a href={REDDIT_HREF} target="_blank" rel="noopener noreferrer" onClick={close} className={rowClass}>
            <RowIcon icon={MessageCircle} />
            Community on Reddit
            <ExternalLink className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </a>
          <a href={EMPLOYERS_HREF} target="_blank" rel="noopener noreferrer" onClick={close} className={rowClass}>
            <RowIcon icon={Building2} />
            For employers
            <ExternalLink className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </a>
          <button type="button" className={cn(rowClass, "text-left")}>
            <RowIcon icon={Plus} />
            Add a career page
          </button>
        </nav>

        <div className="mt-auto border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <SlidingTabs className="w-full" options={THEME_OPTIONS} value={theme} onChange={setTheme} ariaLabel="Theme" tabClassName="flex-1 justify-center" />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
