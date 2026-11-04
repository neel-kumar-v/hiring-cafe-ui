"use client";

import { Switch } from "@/components/ui/switch";
import { useCardPrefs } from "@/contexts/CardPrefsContext";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useId, useEffect, useRef, useState } from "react";

function PrefRow({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-primary/5">
      {/* `button` is a labelable element, so htmlFor forwards label clicks to the Switch. */}
      <label htmlFor={id} className="cursor-pointer select-none text-foreground/90">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/**
 * Floating card-display settings toolbar. Sits at the bottom of the sidebar,
 * directly above the footer icon buttons (Employers / About / Reddit / theme),
 * so it never overlaps them. Collapses to a single trigger; the panel opens
 * upward. Rendered both in the expanded sidebar footer and in the collapsed
 * icon ribbon.
 */
export function CardDisplaySettingsToolbar({ variant }: { variant: "expanded" | "ribbon" }) {
  const { prefs, setPref } = useCardPrefs();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const skillsId = useId();
  const descriptionId = useId();
  const locationsId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeCount =
    Number(prefs.disableSkillsHoverExpansion) + Number(prefs.disableDescriptionHoverExpansion) + Number(prefs.disableLocationsHoverExpansion);

  const trigger =
    variant === "expanded" ? (
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "bg-primary/10 text-primary"
        )}
      >
        <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate font-medium">Card display</span>
        {activeCount > 0 ? (
          <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-4 text-primary-foreground">{activeCount}</span>
        ) : null}
      </button>
    ) : (
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Card display settings"
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
          open && "bg-primary/10 text-primary"
        )}
      >
        <SlidersHorizontal className="size-5" aria-hidden="true" />
        {activeCount > 0 ? <span className="absolute right-1 top-1 size-2 rounded-full bg-primary ring-2 ring-background" /> : null}
      </button>
    );

  return (
    <div ref={rootRef} className={cn("relative", variant === "ribbon" && "w-full")}>
      {trigger}
      {open ? (
        <div
          role="dialog"
          aria-label="Card display settings"
          className={cn(
            "absolute bottom-full z-50 mb-2 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg ring-1 ring-primary/10",
            variant === "expanded" ? "left-0" : "left-1"
          )}
        >
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Disable hover expansion</p>
          <div className="flex flex-col gap-1">
            <PrefRow id={skillsId} label="Skills" checked={prefs.disableSkillsHoverExpansion} onCheckedChange={(checked) => setPref("disableSkillsHoverExpansion", checked)} />
            <PrefRow
              id={descriptionId}
              label="Description"
              checked={prefs.disableDescriptionHoverExpansion}
              onCheckedChange={(checked) => setPref("disableDescriptionHoverExpansion", checked)}
            />
            <PrefRow
              id={locationsId}
              label="Locations"
              checked={prefs.disableLocationsHoverExpansion}
              onCheckedChange={(checked) => setPref("disableLocationsHoverExpansion", checked)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
