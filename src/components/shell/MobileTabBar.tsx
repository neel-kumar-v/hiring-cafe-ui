"use client";

import MobileMoreDrawer from "@/components/shell/MobileMoreDrawer";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BarChart3, Ellipsis, Mail, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabDef {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  isActive: (pathname: string) => boolean;
}

const TABS: TabDef[] = [
  {
    id: "search",
    label: "Search",
    icon: <Search className="size-5" />,
    href: "/",
    isActive: (pathname) => pathname === "/" || Boolean(pathname?.startsWith("/search/")),
  },
  {
    id: "tracker",
    label: "Tracker",
    icon: <BarChart3 className="size-5" />,
    href: "/tracker",
    isActive: (pathname) => pathname === "/tracker",
  },
  {
    id: "network",
    label: "Network",
    icon: <Users className="size-5" />,
    href: "/talent-network",
    isActive: (pathname) => pathname === "/talent-network",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: <Mail className="size-5" />,
    href: "/inbox",
    isActive: (pathname) => pathname === "/inbox",
  },
];

/**
 * Fixed bottom navigation bar for mobile (hidden at `md` and up, where the
 * desktop navbar + sidebar take over): Search | Tracker | Network | Inbox | More.
 * "More" opens the MobileMoreDrawer instead of navigating.
 */
export default function MobileTabBar() {
  const pathname = usePathname() ?? "";
  const [moreOpen, setMoreOpen] = useState(false);

  const tabClass = (active: boolean) =>
    cn(
      "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium leading-none transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <>
      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background-header/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden dark:bg-background/95"
      >
        <div className="mx-auto flex max-w-xl items-stretch justify-around px-2">
          {TABS.map((tab) => {
            const active = tab.isActive(pathname);
            return (
              <Link key={tab.id} href={tab.href!} className={tabClass(active)} aria-current={active ? "page" : undefined}>
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
          <button type="button" className={tabClass(false)} aria-expanded={moreOpen} aria-haspopup="dialog" onClick={() => setMoreOpen(true)}>
            <Ellipsis className="size-5" />
            <span className="truncate">More</span>
          </button>
        </div>
      </nav>

      <MobileMoreDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
