"use client";

import { motion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { cn } from "@/lib/utils";

type TabPosition = {
  left: number;
  width: number;
  opacity: number;
};

function measureTab(list: HTMLElement, tab: HTMLElement): TabPosition {
  const listRect = list.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();
  if (tabRect.width <= 0 || listRect.width <= 0) {
    return {
      left: 0,
      width: 0,
      opacity: 0,
    };
  }
  return {
    left: tabRect.left - listRect.left,
    width: tabRect.width,
    opacity: 1,
  };
}

export type SlidingTabOption<T extends string> = {
  id: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
};

export interface SlidingTabsProps<T extends string> {
  options: readonly SlidingTabOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel?: string;
  className?: string;
  size?: "xs" | "sm" | "md";
  shape?: "rounded" | "pill";
  /**
   * `default` - subtle bordered muted track, background card indicator
   * `primary` - primary tinted track, primary indicator, primary-foreground text when ready
   * `pill` - transparent track with no trough, elevated indicator
   * `ghost` / `transparent` - transparent track, elevated indicator
   * `onDark` - map/dark chrome: transparent track, light moving rect, white text
   */
  tone?: "default" | "primary" | "onDark" | "pill" | "ghost" | "transparent";
  role?: "group" | "radiogroup";
  tabClassName?: string;
  indicatorClassName?: string;
  /** Hide labels and only show icons (when provided) */
  iconOnly?: boolean;
  /** Additional styling or container query for the label wrapper (e.g. "hidden @min-[520px]:inline") */
  labelClassName?: string;
}

/**
 * Segmented control with a spring sliding highlight.
 * Supports rounded rectangle and pill track/indicator shapes.
 */
export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
  size = "sm",
  shape = "rounded",
  tone = "default",
  role = "group",
  tabClassName,
  indicatorClassName,
  iconOnly,
  labelClassName,
}: SlidingTabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [position, setPosition] = useState<TabPosition>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const measureActive = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const tab = tabRefs.current.get(value);
    if (!tab) return;
    const next = measureTab(list, tab);
    setPosition((prev) => (prev.left === next.left && prev.width === next.width && prev.opacity === next.opacity ? prev : next));
  }, [value]);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    measureActive();

    // Double requestAnimationFrame to ensure measurement runs after style/layout passes,
    // container query evaluation (@min-[640px]), or font layout shifts.
    let raf2: number | null = null;
    const raf1 = requestAnimationFrame(() => {
      measureActive();
      raf2 = requestAnimationFrame(() => {
        measureActive();
      });
    });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        measureActive();
      });
      observer.observe(list);
      tabRefs.current.forEach((tab) => {
        observer.observe(tab);
      });
      ro = observer;
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            measureActive();
          }
        }
      });
      io.observe(list);
    }

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          measureActive();
        }
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [measureActive, options]);

  const isPrimary = tone === "primary";
  const onDark = tone === "onDark";
  const isPill = shape === "pill";
  const isTransparentTrack = tone === "pill" || tone === "onDark" || tone === "ghost" || tone === "transparent";

  const isIndicatorReady = position.opacity > 0 && position.width > 0;

  const pad =
    size === "xs"
      ? "h-6 px-2 text-[10px] leading-none"
      : size === "sm"
        ? "h-7.5 px-2.5 sm:px-3 text-xs leading-none"
        : "h-8 sm:h-8.5 px-3 sm:px-3.5 text-xs sm:text-[13px] leading-none";

  const trackPadding = isTransparentTrack ? "p-0" : size === "xs" ? "p-px" : "p-0.5";

  return (
    <div
      ref={listRef}
      role={role}
      aria-label={ariaLabel}
      data-indicator-ready={isIndicatorReady ? "true" : "false"}
      className={cn(
        "relative inline-flex shrink-0 items-center",
        isPill ? "rounded-full" : "rounded-xl",
        trackPadding,
        isPrimary
          ? "border border-primary/20 bg-primary/5 dark:border-primary/25 dark:bg-primary/10"
          : isTransparentTrack
            ? "border-0 bg-transparent"
            : "border border-border/60 bg-muted/40 dark:bg-muted/25",
        className
      )}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        const disabled = Boolean(opt.disabled);
        return (
          <button
            key={opt.id}
            type="button"
            role={role === "radiogroup" ? "radio" : undefined}
            disabled={disabled}
            ref={(el) => {
              if (el) tabRefs.current.set(opt.id, el);
              else tabRefs.current.delete(opt.id);
            }}
            onClick={() => {
              if (!disabled) onChange(opt.id);
            }}
            className={cn(
              "relative z-10 inline-flex items-center justify-center font-medium leading-none whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              isPill ? "rounded-full" : "rounded-md",
              pad,
              disabled && "cursor-not-allowed opacity-35",
              isPrimary
                ? active
                  ? isIndicatorReady
                    ? "text-primary-foreground"
                    : "text-primary dark:text-primary/70"
                  : "text-primary dark:text-primary/70 hover:text-primary dark:hover:text-primary"
                : onDark
                  ? active
                    ? "text-white"
                    : "text-white/70 hover:!text-white disabled:hover:!text-white/70"
                  : active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
              tabClassName
            )}
            aria-pressed={role === "group" ? active : undefined}
            aria-checked={role === "radiogroup" ? active : undefined}
            data-state={active ? "active" : "inactive"}
            data-indicator-ready={active && isIndicatorReady ? "true" : undefined}
            aria-label={opt.ariaLabel}
            aria-disabled={disabled || undefined}
            title={opt.ariaLabel || (typeof opt.label === "string" ? opt.label : undefined)}
          >
            {opt.icon ? (
              <span className="inline-flex items-center gap-1.5 leading-none">
                <span className="shrink-0 flex items-center justify-center">{opt.icon}</span>
                {opt.label ? <span className={cn("leading-none", iconOnly ? "hidden" : labelClassName)}>{opt.label}</span> : null}
              </span>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
      <motion.div
        aria-hidden
        initial={false}
        animate={{
          left: position.left,
          width: position.width,
          opacity: position.opacity,
        }}
        transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}
        className={cn(
          "pointer-events-none absolute z-0",
          isPill ? "rounded-full" : "rounded-md",
          isTransparentTrack ? "inset-y-0" : size === "xs" ? "top-px bottom-px" : "top-0.5 bottom-0.5",
          isPrimary
            ? "bg-primary border-primary shadow-sm dark:bg-primary dark:border-primary"
            : tone === "onDark"
              ? "bg-white/15"
              : tone === "pill" || tone === "ghost" || tone === "transparent"
                ? "bg-background shadow-xs border border-border/50 dark:bg-muted dark:border-border/60 dark:shadow-xs"
                : "bg-background shadow-sm border border-border/40 dark:bg-muted dark:border-border/60 dark:shadow-sm",
          indicatorClassName
        )}
      />
    </div>
  );
}
