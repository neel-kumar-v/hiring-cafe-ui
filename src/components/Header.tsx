"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { ThemeIconSwap } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { useCollapsibleHeight } from "@/hooks/useCollapsibleHeight";
import { BarChart3, Building, CircleUser, ExternalLink, Info, ListFilterPlus, Mail, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Clock } from "./Clock";
import SearchBar from "./search/SearchBar";
import SearchFilters from "./search/SearchFilters";

function HomeSearchFiltersRibbon({ open, onIconClick }: { open: boolean; onIconClick: (category: string) => void }) {
  const { contentRef, containerProps } = useCollapsibleHeight(open);
  return (
    <div {...containerProps}>
      <div ref={contentRef}>
        <div className="pb-4">
          <SearchFilters onIconClick={onIconClick} />
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { showFilterRibbon, showLegacyFilters, setShowLegacyFilters, handleSearchIconClick, boardSearchQuery, setBoardSearchQuery } = useSearchUI();

  const handleSearch = (value: string) => {
    setBoardSearchQuery(value);
  };

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background-header", pathname === "/" && "hidden md:block")}>
      <div className="mx-auto max-w-full px-4 transition-[padding] duration-500 ease-in-out lg:px-8 ">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex items-center space-x-0 lg:space-x-3">
            <BrandLogo />
            <Link className="hidden font-bold text-primary text-xl lg:block" href="/">
              CloneCafe
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mx-8 min-w-0 flex-1">
            <SearchBar value={boardSearchQuery} onSearch={handleSearch} onIconClick={handleSearchIconClick} />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Clock />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="size-8 rounded-full p-0" size="sm" variant="default">
                  <User className="size-5 text-primary-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/tracker">
                    <BarChart3 className="mr-2 size-4" />
                    Job Tracker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <CircleUser className="mr-2 size-4" />
                    Account
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Users className="mr-2 size-4" />
                  Talent Network
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 size-4" />
                  Inbox
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building className="mr-2 size-4" />
                  Employers
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                  <Info className="mr-2 size-4" />
                  About Us
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 size-4" />
                  Follow on Reddit
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={() => toggleDarkMode()}>
                  <ThemeIconSwap isDarkMode={isDarkMode} className="mr-2" />
                  {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLegacyFilters(!showLegacyFilters)}>
                  <ListFilterPlus className="mr-2 size-4" />
                  {showLegacyFilters ? "Hide Legacy Filters" : "Show Legacy Filters"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {pathname === "/" ? <HomeSearchFiltersRibbon open={showFilterRibbon} onIconClick={handleSearchIconClick} /> : null}
      </div>
    </header>
  );
}
