"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useSearchUI } from "@/contexts/SearchContext";
import {
  BarChart3,
  Building,
  CircleUser,
  ExternalLink,
  Info,
  ListFilterPlus,
  Mail,
  Moon,
  Settings,
  Sun,
  User,
  Users,
  Zap,
  ZapOff,
} from "lucide-react";
import Link from "next/link";
import { Clock } from "./Clock";
import SearchBar from "./search/SearchBar";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { prefersReducedMotion, toggleReducedMotion } = useReducedMotion();
  const { showLegacyFilters, setShowLegacyFilters, handleSearchIconClick } = useSearchUI();

  const handleSearch = (value: string) => {
    // Handle search functionality here
    console.log("Searching for:", value);
  };

  return (
    <header className="sticky top-0 z-50 border-neutral-200 border-b bg-white dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-full px-4 transition-[padding] duration-500 ease-in-out lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-0 lg:space-x-3">
            <div className="w-fit rounded-full bg-pink-500 p-2 text-white">
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
            <Link
              className="hidden font-bold text-pink-500 text-xl lg:block"
              href="/"
            >
              CloneCafe
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mx-8 flex-1">
            <div className="flex space-x-2">
              <SearchBar onSearch={handleSearch} onIconClick={handleSearchIconClick} />
            </div>
          </div>


          {/* Right Side */}
          <div className="flex items-center sm:space-x-4">
            <Clock />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-8 w-8 rounded-full bg-pink-500 p-2 hover:bg-pink-600 dark:bg-pink-500 dark:hover:bg-pink-600"
                  size="sm"
                  variant="ghost"
                >
                  <User className="size-5 text-white" />
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

                <DropdownMenuItem onClick={toggleDarkMode}>
                  {isDarkMode ? (
                    <Sun className="mr-2 size-4" />
                  ) : (
                    <Moon className="mr-2 size-4" />
                  )}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleReducedMotion}>
                  {prefersReducedMotion ? (
                    <Zap className="mr-2 size-4" />
                  ) : (
                    <ZapOff className="mr-2 size-4" />
                  )}
                  {prefersReducedMotion ? "Enable Animations" : "Reduce Motion"}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => setShowLegacyFilters(!showLegacyFilters)}>
                  <ListFilterPlus className="mr-2 size-4" />
                  {showLegacyFilters
                    ? "Hide Legacy Filters"
                    : "Show Legacy Filters"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
