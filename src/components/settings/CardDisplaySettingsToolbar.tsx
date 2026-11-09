"use client";

import { Switch } from "@/components/ui/switch";
import { useCardPrefs } from "@/contexts/CardPrefsContext";
import { useSearchUI } from "@/contexts/SearchContext";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { useId, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Ctrl/Cmd+Shift+Period. Browsers do not bind this chord. Shift makes `key` ">", so match `code`. */
export function isCardSettingsShortcut(event: KeyboardEvent) {
  if (event.repeat || event.altKey) return false;
  if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return false;
  return event.code === "Period";
}

export function cardSettingsShortcutLabel() {
  const platform = typeof navigator === "undefined" ? "" : `${navigator.platform} ${navigator.userAgent}`;
  return /Mac|iPhone|iPad|iPod/.test(platform) ? "⌘⇧." : "Ctrl+Shift+.";
}

function PrefRow({
  id,
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-md px-1.5 py-1.5 text-sm transition-colors", !disabled && "hover:bg-primary/5", disabled && "opacity-50")}>
      {/* `button` is a labelable element, so htmlFor forwards label clicks to the Switch. */}
      <label htmlFor={id} className={cn("select-none text-foreground/90", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        {label}
      </label>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/**
 * Card-display settings toolbar. Collapses to a single trigger; the panel opens
 * upward with one switch per hover-expansion pref (Skills / Description /
 * Locations). In the sidebar it sits above the footer icon buttons; as a
 * floating control it anchors to the viewport's bottom-right
 * (`panelAlign="right"` keeps the panel on-screen there).
 */
export function CardDisplaySettingsToolbar({
  variant,
  panelAlign = "left",
  expansionsDisabled = false,
}: {
  variant: "expanded" | "ribbon";
  panelAlign?: "left" | "right";
  /** List layout has no card hover expansion, so those switches stay visible but cannot be changed. */
  expansionsDisabled?: boolean;
}) {
  const { prefs, setPref } = useCardPrefs();
  const { setSearchMode, setChatOpen } = useSearchUI();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const skillsId = useId();
  const descriptionId = useId();
  const locationsId = useId();
  const squareCornersId = useId();
  const hoverTrailId = useId();
  const noAiId = useId();

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
    Number(prefs.disableSkillsHoverExpansion) +
    Number(prefs.disableDescriptionHoverExpansion) +
    Number(prefs.disableLocationsHoverExpansion) +
    Number(prefs.squareCorners) +
    Number(!prefs.hoverTrail) +
    Number(prefs.noAi);

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
            panelAlign === "right" ? "right-0" : variant === "expanded" ? "left-0" : "left-1"
          )}
        >
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Disable hover expansion</p>
          <div className="flex flex-col gap-1">
            <PrefRow
              id={skillsId}
              label="Skills"
              checked={prefs.disableSkillsHoverExpansion}
              disabled={expansionsDisabled}
              onCheckedChange={(checked) => setPref("disableSkillsHoverExpansion", checked)}
            />
            <PrefRow
              id={descriptionId}
              label="Description"
              checked={prefs.disableDescriptionHoverExpansion}
              disabled={expansionsDisabled}
              onCheckedChange={(checked) => setPref("disableDescriptionHoverExpansion", checked)}
            />
            <PrefRow
              id={locationsId}
              label="Locations"
              checked={prefs.disableLocationsHoverExpansion}
              disabled={expansionsDisabled}
              onCheckedChange={(checked) => setPref("disableLocationsHoverExpansion", checked)}
            />
          </div>
          <p className="mt-3 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Appearance</p>
          <div className="flex flex-col gap-1">
            <PrefRow id={squareCornersId} label="Square corners" checked={prefs.squareCorners} onCheckedChange={(checked) => setPref("squareCorners", checked)} />
            <PrefRow id={hoverTrailId} label="Hover trail" checked={prefs.hoverTrail} onCheckedChange={(checked) => setPref("hoverTrail", checked)} />
          </div>
          <p className="mt-3 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">AI</p>
          <div className="flex flex-col gap-1">
            <PrefRow
              id={noAiId}
              label="No AI"
              checked={prefs.noAi}
              onCheckedChange={(checked) => {
                setPref("noAi", checked);
                if (checked) {
                  setSearchMode("classic");
                  setChatOpen(false);
                }
              }}
            />
          </div>
          {variant === "ribbon" ? (
            <button
              type="button"
              className="mt-3 w-full rounded-md border-t border-border px-1.5 pt-2.5 pb-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
              onClick={() => {
                setOpen(false);
                setPref("floatingToolbarHidden", true);
                toast(`Press ${cardSettingsShortcutLabel()} to show this again`);
              }}
            >
              Hide this bar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
