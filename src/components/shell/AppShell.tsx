"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import { MobileTopBar } from "@/components/shell/AvatarPill";
import AppSidebar from "@/components/shell/AppSidebar";
import Navbar from "@/components/shell/Navbar";
import SearchSubHeader from "@/components/shell/SearchSubHeader";
import { useSearchUI } from "@/contexts/SearchContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useResizableWidth } from "@/hooks/useResizableWidth";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

export const SIDEBAR_RIBBON_WIDTH = 56;
const SIDEBAR_WIDTH_KEY = "hiring-cafe-sidebar-width";
const CHAT_WIDTH_KEY = "hiring-cafe-chat-width";

const DEFAULT_TITLES: Record<string, string> = {
  "/tracker": "Job Tracker",
  "/account": "Account",
  "/talent-network": "Talent Network",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, chatOpen, setNavbarTitle, setChatOpen } = useSearchUI();
  const isChatDocked = useMediaQuery("(min-width: 1280px)");

  const sidebarRailRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const applySidebarLiveWidth = useCallback((w: number) => {
    if (sidebarRailRef.current) {
      sidebarRailRef.current.style.width = `${w}px`;
    }
    if (shellRef.current) {
      shellRef.current.style.setProperty("--shell-left", `${w}px`);
    }
  }, []);

  const applyChatLiveWidth = useCallback((w: number) => {
    if (chatPanelRef.current) {
      chatPanelRef.current.style.width = `${w}px`;
    }
    if (shellRef.current) {
      shellRef.current.style.setProperty("--shell-right", `${w}px`);
    }
  }, []);

  const sidebar = useResizableWidth({
    storageKey: SIDEBAR_WIDTH_KEY,
    defaultWidth: 830,
    min: 200,
    max: 960,
    collapsed: !sidebarOpen,
    collapsedWidth: SIDEBAR_RIBBON_WIDTH,
    applyLiveWidth: applySidebarLiveWidth,
    onExpand: () => setSidebarOpen(true),
    onCollapse: () => setSidebarOpen(false),
  });
  const chat = useResizableWidth({
    storageKey: CHAT_WIDTH_KEY,
    defaultWidth: 400,
    min: 320,
    max: 560,
    collapsed: !chatOpen,
    collapsedWidth: 0,
    applyLiveWidth: applyChatLiveWidth,
    onExpand: () => setChatOpen(true),
    onCollapse: () => setChatOpen(false),
  });

  useEffect(() => {
    const currentPath = pathname;
    if (!currentPath) return;
    const isSearchRoute = currentPath === "/" || currentPath.startsWith("/search/");
    if (!isSearchRoute) setChatOpen(false);
    const match = Object.keys(DEFAULT_TITLES).find((route) => route === currentPath);
    if (match) setNavbarTitle(DEFAULT_TITLES[match]);
  }, [pathname, setNavbarTitle, setChatOpen]);

  const isSearchRoute = pathname ? pathname === "/" || pathname.startsWith("/search/") : false;
  const leftWidth = sidebarOpen ? sidebar.width : SIDEBAR_RIBBON_WIDTH;
  const showDockedChat = Boolean(isSearchRoute && chatOpen && isChatDocked);

  return (
    <div className="min-h-screen bg-background-body">
      {/* Fixed left sidebar — ribbon when collapsed, resizable when expanded */}
      <div ref={sidebarRailRef} className="fixed inset-y-0 left-0 z-30 hidden md:flex" style={{ width: leftWidth }}>
        <AppSidebar className="w-full" collapsed={!sidebarOpen} />
        {/* Edge divider / resize handle: interactive in both expanded and ribbon modes */}
        <button
          type="button"
          aria-label={sidebarOpen ? "Resize sidebar (drag left to collapse)" : "Expand sidebar (drag right to expand)"}
          aria-expanded={sidebarOpen}
          tabIndex={0}
          className="absolute inset-y-0 right-0 z-10 w-1.5 cursor-col-resize border-r border-border bg-transparent touch-none transition-colors hover:bg-primary/30 after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5"
          onPointerDown={(event) => sidebar.startResize(event, { edge: "right" })}
          onDoubleClick={() => setSidebarOpen(!sidebarOpen)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setSidebarOpen(!sidebarOpen);
            }
          }}
        />
      </div>

      <div
        ref={shellRef}
        className="flex min-h-screen min-w-0 flex-col md:pl-[var(--shell-left)] xl:pr-[var(--shell-right)]"
        style={
          {
            "--shell-left": `${leftWidth}px`,
            "--shell-right": showDockedChat ? `${chat.width}px` : "0px",
          } as CSSProperties
        }
      >
        {!isSearchRoute ? <MobileTopBar /> : null}
        <Navbar className="hidden md:flex" />
        {isSearchRoute ? <SearchSubHeader className="hidden md:block" /> : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {isSearchRoute ? (
        <ChatPanel panelRef={chatPanelRef} width={chat.width} onResizeStart={isChatDocked ? (event: ReactPointerEvent) => chat.startResize(event, { edge: "left" }) : undefined} />
      ) : null}
    </div>
  );
}
