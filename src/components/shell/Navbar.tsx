"use client";

import SearchBar from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { useSearchUI } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";
import { PanelLeft, PanelRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Control on the left side of Navbar to toggle the left AppSidebar.
 */
export function LeftSidebarToggle() {
  const { sidebarOpen, setSidebarOpen } = useSearchUI();
  return (
    <Button
      variant="ghost"
      className="size-9 rounded-lg p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
      aria-label={sidebarOpen ? "Collapse sidebar to icons" : "Expand sidebar"}
      title={sidebarOpen ? "Collapse sidebar to icons" : "Expand sidebar"}
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      <PanelLeft className="size-[18px]" />
    </Button>
  );
}

/**
 * Control on the right side of Navbar to toggle the right AI chat sidebar.
 * Hidden when the AI chat bar is unavailable (Feedback #20).
 */
export function SidebarToggle() {
  const pathname = usePathname();
  const isChatAvailable = pathname === "/" || Boolean(pathname?.startsWith("/search/"));
  const { chatOpen, setChatOpen } = useSearchUI();

  if (!isChatAvailable) return null;

  return (
    <Button
      variant="ghost"
      className="size-9 rounded-lg p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary"
      aria-label={chatOpen ? "Hide chat sidebar" : "Show chat sidebar"}
      title={chatOpen ? "Hide AI chat" : "Show AI chat"}
      onClick={() => setChatOpen(!chatOpen)}
    >
      <PanelRight className="size-[18px]" />
    </Button>
  );
}

interface NavbarProps {
  className?: string;
  searchLeadingSlot?: ReactNode;
  searchTrailingSlot?: ReactNode;
}

/**
 * Slim navbar of the new app frame:
 * - Left: control for left AppSidebar
 * - Center: the shared SearchBar on every route, so the sticky top bar always
 *   exposes the same search component regardless of the page (search, inbox,
 *   tracker, account, talent network)
 * - Right: AI chat sidebar toggle (when chat is available)
 */
export default function Navbar({ className, searchLeadingSlot, searchTrailingSlot }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isSearchRoute = pathname === "/" || Boolean(pathname?.startsWith("/search/"));
  const { boardSearchQuery, setBoardSearchQuery, handleSearchIconClick } = useSearchUI();

  return (
    <header className={cn("sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background-header px-2 dark:bg-background", className)}>
      {/* Left zone: left sidebar control — flush to sidebar edge */}
      <div className="flex shrink-0 items-center">
        <LeftSidebarToggle />
      </div>

      {/* Center zone: the shared search bar on every route, never a bare title */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-3">
        <div className="flex w-full max-w-4xl min-w-0 items-center gap-2">
          {searchLeadingSlot}
          <SearchBar
            value={boardSearchQuery}
            onSearch={setBoardSearchQuery}
            onSubmit={() => {
              if (!isSearchRoute) {
                router.push("/");
              }
            }}
            onIconClick={handleSearchIconClick}
            className="w-full"
          />
          {searchTrailingSlot}
        </div>
      </div>

      {/* Right zone: rewired AI chat sidebar toggle (mobile nav lives in the bottom tab bar) */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <SidebarToggle />
      </div>
    </header>
  );
}
