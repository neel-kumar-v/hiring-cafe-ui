"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type RangeSliderValue = [number, number];

export interface RangeSliderProps {
  value: RangeSliderValue;
  onValueChange?: (value: RangeSliderValue) => void;
  /** Fires when the pointer is released (or the thumbs settle). Prefer this for expensive updates. */
  onValueCommit?: (value: RangeSliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Dual-thumb range control built on the shared Slider primitive.
 * Renamed from the shadcn `c-slider-6` example; colors follow the app primary token.
 */
export function RangeSlider({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  className,
  "aria-label": ariaLabel = "Range",
}: RangeSliderProps) {
  return (
    <Slider
      aria-label={ariaLabel}
      className={cn("w-full", className)}
      disabled={disabled}
      max={max}
      min={min}
      step={step}
      value={value}
      onValueChange={(next) => {
        if (next.length < 2) return;
        const low = Math.min(next[0], next[1]);
        const high = Math.max(next[0], next[1]);
        onValueChange?.([low, high]);
      }}
      onValueCommit={(next) => {
        if (next.length < 2) return;
        const low = Math.min(next[0], next[1]);
        const high = Math.max(next[0], next[1]);
        onValueCommit?.([low, high]);
      }}
    />
  );
}
