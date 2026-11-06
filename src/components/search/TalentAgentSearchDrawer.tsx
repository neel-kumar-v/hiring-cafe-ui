"use client";

import { useEffect, useRef } from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import MobileSavedSearchCards from "./MobileSavedSearchCards";

interface TalentAgentSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function TalentAgentSearchDrawer({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
}: TalentAgentSearchDrawerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="rounded-t-xl bg-background p-0">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Ask Talent Agent</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-6 p-4 pb-8">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you're looking for..."
              className="h-12 w-full rounded-full border border-border bg-secondary/40 pl-12 pr-24 text-base transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Sparkles className="absolute left-4 size-5 text-primary" />
            <Button
              size="sm"
              onClick={onSubmit}
              className="absolute right-1.5 h-9 rounded-full px-4"
            >
              Ask
            </Button>
          </div>

          <div className="space-y-2">
            <div className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Saved Agent Chats
            </div>
            <MobileSavedSearchCards />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
