"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface MoreLocationsControlProps {
  /** How many locations are hidden behind the control. */
  count: number;
  /** The hidden locations, one per line (`\n`-joined). */
  locationsText: string;
  className?: string;
}

/**
 * "+N more" location disclosure.
 *
 * This used to be a hover-only `Tooltip`, which never opens on touch: a tap on
 * the label did nothing and the tap could fall through to the card and open the
 * job. It is now a click/tap-toggled popover — the trigger stops propagation and
 * carries `data-card-action` so the enclosing job card ignores the tap — while
 * hover-capable pointers still get the list on hover.
 */
export default function MoreLocationsControl({ count, locationsText, className }: MoreLocationsControlProps) {
  const [open, setOpen] = useState(false);

  const handlePointerEnter = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    // Touch taps emit synthetic enter events; only hover-capable pointers open
    // on enter there, otherwise the follow-up click would toggle it right shut.
    if (event.pointerType === "mouse") setOpen(true);
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse") setOpen(false);
  }, []);

  if (count <= 0 || !locationsText) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-card-action="true"
          aria-label={`Show ${count} more location${count === 1 ? "" : "s"}`}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          // Belt and braces: the card also skips interactive targets, but the
          // tap must never reach the dialog opener.
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center text-[0.8125rem] font-medium leading-snug tracking-[0.01em] text-foreground/50 underline-offset-2 transition-colors hover:text-foreground/75 hover:underline focus:outline-none focus-visible:text-foreground/75 focus-visible:underline",
            className
          )}
        >
          +{count} more
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={4}
        className="max-h-60 max-w-xs overflow-y-auto border-border/60 bg-popover px-3 py-2 text-xs shadow-lg"
        // Read-only disclosure: never move focus off the page (hover-open used to
        // snatch focus, and a hover-close used to drop it back on the trigger).
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <p className="whitespace-pre-line leading-snug">{locationsText}</p>
      </PopoverContent>
    </Popover>
  );
}
