"use client";

import React, { memo, startTransition, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { type CountedListOptions, formatCountedList } from "@/lib/search/sentence-query";
import { RangeSlider, type RangeSliderValue } from "@/components/ui/range-slider";
import MinMax from "./MinMax";

// ---------------------------------------------------------------------------
// Shared shell used by every sentence-query title
// ---------------------------------------------------------------------------

// Full-opacity foreground — opacity washes out badly in light mode.
const sentenceTextDefaultClasses = "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[15px] font-normal leading-relaxed text-foreground";

/** Wraps the plain parts of a sentence-query title ("Show jobs from", "Sort jobs by", …). */
export function SentenceText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn(sentenceTextDefaultClasses, className)}>{children}</span>;
}

/** Styling shared by every sentence-query blank trigger (dotted underline + chevron). */
export const sentenceBlankTriggerClasses =
  "inline-flex shrink-0 items-center gap-0.5 font-semibold text-foreground underline decoration-dotted decoration-foreground/40 underline-offset-[3px] hover:text-primary hover:decoration-primary cursor-pointer";

/** Empty sentence blanks must read as this word — never a bare hyphen/en/em dash. */
export const UNSPECIFIED_BLANK = "unspecified";

const DASH_BLANKS = new Set(["-", "–", "—"]);

/** True when `value` is empty or a bare dash (ASCII / en / em) used as a blank placeholder. */
export function isDashBlank(value: string | null | undefined): boolean {
  if (value == null) return true;
  const trimmed = value.trim();
  return !trimmed || DASH_BLANKS.has(trimmed);
}

/** Coerce empty/dash placeholders to `unspecified` (or an explicit non-dash fallback). */
export function unspecifiedBlank(value: string | null | undefined, fallback: string = UNSPECIFIED_BLANK): string {
  return isDashBlank(value) ? fallback : value!.trim();
}

// ---------------------------------------------------------------------------
// Shared search/filter helpers for sentence blank dropdowns
// ---------------------------------------------------------------------------

/** Option count threshold to automatically show the inline search input at the top of the menu. */
export const SENTENCE_BLANK_SEARCH_THRESHOLD = 8;

export interface SentenceBlankSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  ariaLabel?: string;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Compact inline search input pinned to the top of sentence blank dropdown menus.
 * Mimics CommandInput styling and intercepts keys to avoid Radix menu typeahead collisions.
 */
export function SentenceBlankSearchInput({ value, onChange, inputRef, placeholder = "Search...", ariaLabel = "Search options", onKeyDown }: SentenceBlankSearchInputProps) {
  return (
    <div
      className="sticky-dialog-header sticky -top-1 z-10 -mx-1 -mt-1 mb-1 flex h-8 items-center gap-1.5 border-b border-border/60 bg-popover px-2"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Search className="size-3.5 shrink-0 text-muted-foreground opacity-50" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="flex h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Escape" || event.key === "Tab") {
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            const content = event.currentTarget.closest('[data-slot="dropdown-menu-content"]');
            const firstItem = content?.querySelector<HTMLElement>(
              '[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-checkbox-item"], [role="menuitem"], [role="menuitemcheckbox"]'
            );
            firstItem?.focus();
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const content = event.currentTarget.closest('[data-slot="dropdown-menu-content"]');
            const firstItem = content?.querySelector<HTMLElement>(
              '[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-checkbox-item"], [role="menuitem"], [role="menuitemcheckbox"]'
            );
            firstItem?.click();
            return;
          }
          event.stopPropagation();
          onKeyDown?.(event);
        }}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={(event) => {
            event.stopPropagation();
            onChange("");
            inputRef?.current?.focus();
          }}
          className="cursor-pointer rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export interface UseSentenceBlankSearchOptions<T extends { label: string; phrase?: string }> {
  options: ReadonlyArray<T>;
  searchable?: boolean;
  searchThreshold?: number;
}

/** Cap rendered rows. Filtering still searches the full list; only the visible slice is mounted. */
const SENTENCE_BLANK_RENDER_LIMIT = 40;

function filterSentenceOptions<T extends { label: string; phrase?: string }>(options: ReadonlyArray<T>, query: string): ReadonlyArray<T> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return options;
  return options.filter((option) => {
    if (option.label.toLowerCase().includes(trimmed)) return true;
    return option.phrase ? option.phrase.toLowerCase().includes(trimmed) : false;
  });
}

export function useSentenceBlankSearch<T extends { label: string; phrase?: string }>({
  options,
  searchable,
  searchThreshold = SENTENCE_BLANK_SEARCH_THRESHOLD,
}: UseSentenceBlankSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  // Filtering the (often 250-item) list yields to the keystroke; the input itself stays urgent.
  const deferredQuery = useDeferredValue(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchable = searchable ?? options.length >= searchThreshold;

  const filteredOptions = useMemo(() => {
    if (!isSearchable) return options;
    const matches = filterSentenceOptions(options, deferredQuery);
    return matches.length > SENTENCE_BLANK_RENDER_LIMIT ? matches.slice(0, SENTENCE_BLANK_RENDER_LIMIT) : matches;
  }, [options, isSearchable, deferredQuery]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSearchQuery("");
    }
  }, []);

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      if (isSearchable) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    },
    [isSearchable]
  );

  return {
    isSearchable,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    inputRef,
    handleOpenChange,
    handleOpenAutoFocus,
  };
}

// ---------------------------------------------------------------------------
// Dropdown blank (single select)
// ---------------------------------------------------------------------------

export interface SentenceBlankSelectOption<T> {
  value: T;
  /** Label shown in the dropdown list. */
  label: string;
  /** Phrase rendered inside the sentence when selected. Defaults to `label`. */
  phrase?: string;
}

export interface SentenceBlankSelectProps<T> {
  options: ReadonlyArray<SentenceBlankSelectOption<T>>;
  /** Currently selected value; must match an option's `value`. */
  value: T | undefined;
  onChange: (value: T) => void;
  /** Accessible label for the blank trigger. */
  ariaLabel: string;
  /** Rendered in the trigger when `value` matches no option. */
  placeholder?: string;
  /** Extra classes for the wrapping sentence container. */
  className?: string;
  contentClassName?: string;
  /** Explicitly enable/disable the search filter input. Defaults to true when options.length >= searchThreshold. */
  searchable?: boolean;
  /** Option count threshold to automatically enable search. Defaults to 8. */
  searchThreshold?: number;
  /** Placeholder text for the search input. Defaults to "Search...". */
  searchPlaceholder?: string;
}

/**
 * Interactive dropdown blank inside a sentence-query title. Renders the selected
 * option's phrase as a dotted-underline trigger with a chevron; the menu lists the
 * checkmarked options. Used by single-select sentence filters
 * (DateRange / Sorting, …).
 */
function SentenceBlankSelectInner<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  placeholder = UNSPECIFIED_BLANK,
  className,
  contentClassName,
  searchable,
  searchThreshold,
  searchPlaceholder,
}: SentenceBlankSelectProps<T>) {
  const selected = options.find((option) => option.value === value);
  const effectivePlaceholder = unspecifiedBlank(placeholder);
  const rawTrigger = selected?.phrase ?? selected?.label ?? effectivePlaceholder;
  const triggerText = unspecifiedBlank(rawTrigger, effectivePlaceholder);

  const { isSearchable, searchQuery, setSearchQuery, filteredOptions, inputRef, handleOpenChange, handleOpenAutoFocus } = useSentenceBlankSearch({
    options,
    searchable,
    searchThreshold,
  });

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={ariaLabel} className={cn(sentenceBlankTriggerClasses, className)} onClick={(event) => event.stopPropagation()}>
          <span>{triggerText}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(isSearchable ? "w-56 max-h-64" : "w-48", "p-1", contentClassName)}
        onClick={(event) => event.stopPropagation()}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        {isSearchable ? (
          <SentenceBlankSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            inputRef={inputRef}
            placeholder={searchPlaceholder ?? "Search..."}
            ariaLabel={`Search ${ariaLabel}`}
          />
        ) : null}
        {filteredOptions.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground select-none">No options found</div>
        ) : (
          filteredOptions.map((option, index) => (
            <DropdownMenuItem
              key={String(option.value)}
              onSelect={() => onChange(option.value)}
              onKeyDown={(event) => {
                if (isSearchable && index === 0 && event.key === "ArrowUp") {
                  event.preventDefault();
                  inputRef.current?.focus();
                }
              }}
            >
              {option.label}
              <Check className={cn("ml-auto size-4 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} aria-hidden="true" />
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const SentenceBlankSelect = memo(SentenceBlankSelectInner) as typeof SentenceBlankSelectInner;

// ---------------------------------------------------------------------------
// Dropdown blank (multi select)
// ---------------------------------------------------------------------------

export interface SentenceBlankMultiSelectOption<T> {
  value: T;
  /** Label shown in the dropdown list. */
  label: string;
  /** Phrase rendered inside the sentence when selected. Defaults to `label`. */
  phrase?: string;
}

export interface SentenceBlankMultiSelectProps<T> {
  options: ReadonlyArray<SentenceBlankMultiSelectOption<T>>;
  /** Currently selected values. */
  values: readonly T[];
  onChange: (values: T[]) => void;
  /** Accessible label for the blank trigger. */
  ariaLabel: string;
  /** Rendered in the trigger when nothing is selected and `formatOptions.noneText` is not provided. */
  placeholder?: string;
  /** Options controlling multi-select formatting (N1/N2 thresholds, conjunction, etc.). */
  formatOptions?: CountedListOptions;
  className?: string;
  contentClassName?: string;
  /** Explicitly enable/disable the search filter input. Defaults to true when options.length >= searchThreshold. */
  searchable?: boolean;
  /** Option count threshold to automatically enable search. Defaults to 8. */
  searchThreshold?: number;
  /** Placeholder text for the search input. Defaults to "Search...". */
  searchPlaceholder?: string;
}

/**
 * Interactive multi-select dropdown blank inside a sentence-query title.
 * Formats the selected items using `formatCountedList` (N1/N2 thresholds, conjunctions).
 * The dropdown menu keeps open on selection so users can toggle multiple options.
 */
function SentenceBlankMultiSelectInner<T extends string | number>({
  options,
  values,
  onChange,
  ariaLabel,
  placeholder = UNSPECIFIED_BLANK,
  formatOptions,
  className,
  contentClassName,
  searchable,
  searchThreshold,
  searchPlaceholder,
}: SentenceBlankMultiSelectProps<T>) {
  const selectedSet = useMemo(() => new Set(values), [values]);
  const selectedOptions = options.filter((option) => selectedSet.has(option.value));
  const selectedPhrases = selectedOptions.map((option) => option.phrase ?? option.label);

  const effectivePlaceholder = unspecifiedBlank(placeholder);
  const effectiveNoneText = unspecifiedBlank(formatOptions?.noneText, effectivePlaceholder);

  // Spread formatOptions first so cleaned noneText always wins over a dash placeholder.
  const triggerText = unspecifiedBlank(
    formatCountedList(selectedPhrases, {
      ...formatOptions,
      total: options.length,
      noneText: effectiveNoneText,
    }),
    effectivePlaceholder
  );

  const handleToggle = (optionValue: T) => {
    const isSelected = selectedSet.has(optionValue);
    const nextValues = isSelected ? values.filter((v) => v !== optionValue) : [...values, optionValue];
    // The checkmark updates immediately; rebuilding chips/edit counts can wait.
    startTransition(() => onChange(nextValues));
  };

  const { isSearchable, searchQuery, setSearchQuery, filteredOptions, inputRef, handleOpenChange, handleOpenAutoFocus } = useSentenceBlankSearch({
    options,
    searchable,
    searchThreshold,
  });

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={ariaLabel} className={cn(sentenceBlankTriggerClasses, className)} onClick={(event) => event.stopPropagation()}>
          <span>{triggerText}</span>
          <ChevronDown className="size-3.5 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(isSearchable ? "w-56 max-h-64" : "w-56", "p-1", contentClassName)}
        onClick={(event) => event.stopPropagation()}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        {isSearchable ? (
          <SentenceBlankSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            inputRef={inputRef}
            placeholder={searchPlaceholder ?? "Search..."}
            ariaLabel={`Search ${ariaLabel}`}
          />
        ) : null}
        {filteredOptions.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground select-none">No options found</div>
        ) : (
          filteredOptions.map((option, index) => {
            const isChecked = selectedSet.has(option.value);
            return (
              <DropdownMenuCheckboxItem
                key={String(option.value)}
                checked={isChecked}
                onSelect={(event) => {
                  event.preventDefault();
                  handleToggle(option.value);
                }}
                onKeyDown={(event) => {
                  if (isSearchable && index === 0 && event.key === "ArrowUp") {
                    event.preventDefault();
                    inputRef.current?.focus();
                  }
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const SentenceBlankMultiSelect = memo(SentenceBlankMultiSelectInner) as typeof SentenceBlankMultiSelectInner;

// ---------------------------------------------------------------------------
// Inline number blank (min/max/amount value inside a sentence)
// ---------------------------------------------------------------------------

export interface SentenceInlineNumberInputProps {
  /** Raw digits-only text bound to the caller's local state ("", "2010"). */
  value: string;
  onChange: (raw: string) => void;
  /** Commits the bound filter value (usually fired onBlur or Enter). Receives the digits-only draft. */
  onCommit?: (draft: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  widthClassName?: string;
}

/**
 * Interactive number blank inside a sentence-query title. Digits-only input with a
 * dashed feel; the caller keeps the numeric commit logic (clamp/normalize) in the
 * filter component that passes `onCommit`.
 *
 * The field owns a local draft while it is focused, so a parent that re-derives
 * (or normalizes) the bound value can never wipe the digits mid-typing. The draft
 * is pushed to the parent on every change and committed on blur / Enter.
 */
export function SentenceInlineNumberInput({
  value,
  onChange,
  onCommit,
  ariaLabel,
  placeholder = UNSPECIFIED_BLANK,
  className,
  widthClassName = "w-12",
}: SentenceInlineNumberInputProps) {
  const effectivePlaceholder = unspecifiedBlank(placeholder);

  const [draft, setDraft] = useState(value);
  const isEditingRef = useRef(false);
  const boundValueRef = useRef(value);
  boundValueRef.current = value;

  // Re-sync the draft with the bound value, but never while the user is typing.
  useEffect(() => {
    if (isEditingRef.current) return;
    setDraft((current) => (current === boundValueRef.current ? current : boundValueRef.current));
  });

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9]/g, "");
    // Local draft paints immediately; the parent re-derives the whole filter tree.
    startTransition(() => {
      setDraft(cleaned);
      onChange(cleaned);
    });
  };

  const commit = () => {
    const cleaned = draft.replace(/[^0-9]/g, "");
    setDraft(cleaned);
    onChange(cleaned);
    onCommit?.(cleaned);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      className={cn(
        "rounded-sm border border-dashed border-border bg-transparent px-1 py-0.5 text-center text-sm font-semibold text-foreground opacity-100 outline-none placeholder:font-semibold placeholder:text-muted-foreground focus:border-primary focus:bg-accent [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden",
        widthClassName,
        className
      )}
      value={draft}
      placeholder={effectivePlaceholder}
      onClick={(event) => event.stopPropagation()}
      onFocus={() => {
        isEditingRef.current = true;
      }}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={() => {
        isEditingRef.current = false;
        commit();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Popover number blank (underlined trigger → number input)
// ---------------------------------------------------------------------------

export interface SentenceNumberBlankProps {
  /** Raw digits-only text bound to the caller's local state ("", "70000"). */
  value: string;
  onChange: (raw: string) => void;
  /**
   * Commits the bound filter value (fired on popover close, Enter, or Apply).
   * Receives the digits-only draft so callers avoid stale React state.
   */
  onCommit?: (committedValue: string) => void;
  ariaLabel: string;
  /** Trigger text when `value` is empty. Defaults to "unspecified". */
  placeholder?: string;
  /** Placeholder inside the popover input. Defaults to `placeholder`. */
  inputPlaceholder?: string;
  /** Formats the trigger phrase. Defaults to the raw value (or placeholder when empty). */
  formatDisplay?: (value: string) => string;
  /** Visible label above the popover input. Defaults to `ariaLabel`. */
  label?: string;
  /** `money` prefixes the popover input with a currency symbol. */
  variant?: "number" | "money";
  /** Currency symbol used by the `money` variant. */
  currencySymbol?: string;
  className?: string;
}

/**
 * Underlined clickable sentence blank that opens a popover with a number input.
 * Pattern matches Prosperity Index money tokens: dotted-underline trigger, draft
 * input focused/selected on open, commit on close / Enter / Apply.
 */
export function SentenceNumberBlank({
  value,
  onChange,
  onCommit,
  ariaLabel,
  placeholder = UNSPECIFIED_BLANK,
  inputPlaceholder,
  formatDisplay,
  label,
  variant = "number",
  currencySymbol,
  className,
}: SentenceNumberBlankProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOnOpenRef = useRef(false);
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  useEffect(() => {
    if (!open) return;
    // Sync the draft only when the popover opens so typing is never interrupted.
    setDraft(latestValueRef.current);
    selectOnOpenRef.current = true;
    const id = window.setTimeout(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    }, 30);
    return () => window.clearTimeout(id);
  }, [open]);

  const setDigits = (raw: string) => {
    selectOnOpenRef.current = false;
    const cleaned = raw.replace(/[^0-9]/g, "");
    startTransition(() => {
      setDraft(cleaned);
      onChange(cleaned);
    });
  };

  const commit = () => {
    const cleaned = draft.replace(/[^0-9]/g, "");
    onChange(cleaned);
    onCommit?.(cleaned);
  };

  const effectivePlaceholder = unspecifiedBlank(placeholder);
  // Popover input can keep a field-specific hint ("min"/"max"); never a bare dash.
  const effectiveInputPlaceholder = unspecifiedBlank(inputPlaceholder, effectivePlaceholder);

  const isValueEmpty = !value || value === "0" || !value.trim();
  const rawTrigger = !isValueEmpty ? (formatDisplay ? formatDisplay(value) : value) : "";
  const triggerText = unspecifiedBlank(rawTrigger, effectivePlaceholder);
  const isEmpty = triggerText === effectivePlaceholder;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) commit();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" aria-label={ariaLabel} className={cn(sentenceBlankTriggerClasses, className)} onClick={(event) => event.stopPropagation()}>
          <span>{triggerText}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start" sideOffset={6} onClick={(event) => event.stopPropagation()}>
        <MinMax
          mode="single"
          variant={variant}
          currencySymbol={currencySymbol}
          minLabel={label ?? ariaLabel}
          minPlaceholder={effectiveInputPlaceholder}
          minValue={draft}
          onChangeMinValue={setDigits}
          onBlurMin={commit}
          inputRef={inputRef}
          inputProps={{
            "aria-label": ariaLabel,
            autoComplete: "off",
            onFocus: (event) => {
              if (selectOnOpenRef.current) event.currentTarget.select();
            },
            onClick: (event) => {
              if (selectOnOpenRef.current) {
                event.currentTarget.select();
                selectOnOpenRef.current = false;
              }
            },
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
                setOpen(false);
              }
            },
          }}
        />
        <button
          type="button"
          className="mt-2 w-full rounded-md bg-foreground/10 py-1.5 text-xs hover:bg-foreground/15"
          onClick={() => {
            commit();
            setOpen(false);
          }}
        >
          Apply
        </button>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Range / MinMax blank (low and high values inside a sentence)
// ---------------------------------------------------------------------------

export interface SentenceRangeCommitPatch {
  min?: string;
  max?: string;
}

export interface SentenceRangeBlankProps {
  minValue: string;
  maxValue: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  /**
   * Commits the range. Popover blanks pass a patch with both bounds so
   * callers can avoid stale React state; inline blanks call with no patch.
   */
  onCommit?: (patch?: SentenceRangeCommitPatch) => void;
  minAriaLabel?: string;
  maxAriaLabel?: string;
  /** Combined aria-label for the single popover trigger. */
  ariaLabel?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  separator?: React.ReactNode;
  widthClassName?: string;
  className?: string;
  /**
   * `popover` — one underlined blank that opens a range slider.
   * `inline` — dashed bordered inputs in the sentence.
   */
  variant?: "inline" | "popover";
  /** Formats each bound for the trigger / preview when `variant="popover"`. */
  formatDisplay?: (value: string) => string;
  minLabel?: string;
  maxLabel?: string;
  /** @deprecated Kept for callers; popover uses a slider, not money inputs. */
  inputVariant?: "number" | "money";
  /** @deprecated Kept for callers; unused with the range slider popover. */
  currencySymbol?: string;
  /** Inclusive lower bound of the range slider. Defaults to 0. */
  sliderMin?: number;
  /** Inclusive upper bound of the range slider. Defaults to 100. */
  sliderMax?: number;
  /** Slider step. Defaults to 1. Use larger steps for salary-like ranges. */
  sliderStep?: number;
  /**
   * Trigger text when both bounds are unset.
   * Experience years use `"0 - 20"`; salary-like fields keep `"unspecified"`.
   */
  emptyLabel?: string;
  /**
   * When true (default), committing the full `[sliderMin, sliderMax]` span
   * clears the filter (empty strings) instead of writing the extremes.
   */
  fullRangeMeansUnset?: boolean;
  /** Debounce for live parent updates while dragging. Default 120ms. */
  debounceMs?: number;
}

const DEFAULT_RANGE_DEBOUNCE_MS = 120;

function parseBoundNumber(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[^0-9]/g, "");
  if (!cleaned) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function boundsFromStrings(minValue: string, maxValue: string, sliderMin: number, sliderMax: number): RangeSliderValue {
  const parsedMin = parseBoundNumber(minValue);
  const parsedMax = parseBoundNumber(maxValue);
  const low = parsedMin == null ? sliderMin : Math.min(sliderMax, Math.max(sliderMin, parsedMin));
  const high = parsedMax == null ? sliderMax : Math.min(sliderMax, Math.max(sliderMin, parsedMax));
  return low <= high ? [low, high] : [high, low];
}

/**
 * Interactive range blank inside a sentence-query title.
 * Popover mode: one combined blank that opens a dual-thumb RangeSlider.
 * Inline mode: paired dashed number inputs.
 */
export function SentenceRangeBlank({
  minValue,
  maxValue,
  onChangeMin,
  onChangeMax,
  onCommit,
  minAriaLabel = "Minimum value",
  maxAriaLabel = "Maximum value",
  ariaLabel,
  minPlaceholder = "min",
  maxPlaceholder = "max",
  separator = "-",
  widthClassName = "w-12",
  className,
  variant = "popover",
  formatDisplay,
  sliderMin = 0,
  sliderMax = 100,
  sliderStep = 1,
  emptyLabel = UNSPECIFIED_BLANK,
  fullRangeMeansUnset = true,
  debounceMs = DEFAULT_RANGE_DEBOUNCE_MS,
}: SentenceRangeBlankProps) {
  const draftRef = useRef({ min: minValue, max: maxValue });
  useEffect(() => {
    draftRef.current = { min: minValue, max: maxValue };
  }, [minValue, maxValue]);

  const handleChangeMin = (raw: string) => {
    draftRef.current = { ...draftRef.current, min: raw };
    onChangeMin(raw);
  };

  const handleChangeMax = (raw: string) => {
    draftRef.current = { ...draftRef.current, max: raw };
    onChangeMax(raw);
  };

  const commitRange = (side: "min" | "max", committed: string) => {
    draftRef.current = side === "min" ? { ...draftRef.current, min: committed } : { ...draftRef.current, max: committed };
    onCommit?.({ min: draftRef.current.min, max: draftRef.current.max });
  };

  const rangeSeparator = typeof separator === "string" && isDashBlank(separator) ? "-" : (separator ?? "-");

  if (variant === "inline") {
    const cleanMinPlaceholder = unspecifiedBlank(minPlaceholder, "min");
    const cleanMaxPlaceholder = unspecifiedBlank(maxPlaceholder, "max");

    return (
      <span className={cn("inline-flex items-center gap-1", className)} onClick={(event) => event.stopPropagation()}>
        <SentenceInlineNumberInput
          ariaLabel={minAriaLabel}
          value={minValue}
          placeholder={cleanMinPlaceholder}
          widthClassName={widthClassName}
          onChange={handleChangeMin}
          onCommit={(committed) => commitRange("min", committed)}
        />
        <span aria-hidden="true" className="select-none font-normal text-foreground opacity-100">
          {rangeSeparator}
        </span>
        <SentenceInlineNumberInput
          ariaLabel={maxAriaLabel}
          value={maxValue}
          placeholder={cleanMaxPlaceholder}
          widthClassName={widthClassName}
          onChange={handleChangeMax}
          onCommit={(committed) => commitRange("max", committed)}
        />
      </span>
    );
  }

  return (
    <SentenceRangeSliderBlank
      minValue={minValue}
      maxValue={maxValue}
      onChangeMin={onChangeMin}
      onChangeMax={onChangeMax}
      onCommit={onCommit}
      ariaLabel={ariaLabel ?? `${minAriaLabel} to ${maxAriaLabel}`}
      separator={rangeSeparator}
      className={className}
      formatDisplay={formatDisplay}
      sliderMin={sliderMin}
      sliderMax={sliderMax}
      sliderStep={sliderStep}
      emptyLabel={emptyLabel}
      fullRangeMeansUnset={fullRangeMeansUnset}
      debounceMs={debounceMs}
    />
  );
}

function SentenceRangeSliderBlank({
  minValue,
  maxValue,
  onChangeMin,
  onChangeMax,
  onCommit,
  ariaLabel,
  separator,
  className,
  formatDisplay,
  sliderMin,
  sliderMax,
  sliderStep,
  emptyLabel,
  fullRangeMeansUnset,
  debounceMs,
}: {
  minValue: string;
  maxValue: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onCommit?: (patch?: SentenceRangeCommitPatch) => void;
  ariaLabel: string;
  separator: React.ReactNode;
  className?: string;
  formatDisplay?: (value: string) => string;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  emptyLabel: string;
  fullRangeMeansUnset: boolean;
  debounceMs: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RangeSliderValue>(() => boundsFromStrings(minValue, maxValue, sliderMin, sliderMax));
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const debounceTimerRef = useRef<number | null>(null);
  const pendingCommitRef = useRef(false);
  const latestPropsRef = useRef({ minValue, maxValue });
  latestPropsRef.current = { minValue, maxValue };

  const formatBound = useCallback(
    (n: number) => {
      const raw = String(n);
      if (formatDisplay) return formatDisplay(raw);
      return raw;
    },
    [formatDisplay]
  );

  const formatPair = useCallback(
    (low: number, high: number, asUnset: boolean) => {
      if (asUnset) return emptyLabel;
      const left = formatBound(low);
      const right = formatBound(high);
      return (
        <>
          <span>{left}</span>
          <span aria-hidden="true" className="mx-1 select-none font-normal text-foreground opacity-100">
            {separator}
          </span>
          <span>{right}</span>
        </>
      );
    },
    [emptyLabel, formatBound, separator]
  );

  const toPatch = useCallback(
    (value: RangeSliderValue): SentenceRangeCommitPatch => {
      const [low, high] = value;
      if (fullRangeMeansUnset && low <= sliderMin && high >= sliderMax) {
        return { min: "", max: "" };
      }
      return { min: String(low), max: String(high) };
    },
    [fullRangeMeansUnset, sliderMax, sliderMin]
  );

  const flushCommit = useCallback(
    (value: RangeSliderValue) => {
      if (debounceTimerRef.current != null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      pendingCommitRef.current = false;
      const patch = toPatch(value);
      onChangeMin(patch.min ?? "");
      onChangeMax(patch.max ?? "");
      onCommit?.(patch);
    },
    [onChangeMin, onChangeMax, onCommit, toPatch]
  );

  /** Debounce parent/search updates while dragging; flush immediately on pointer-up / close. */
  const scheduleCommit = useCallback(
    (value: RangeSliderValue) => {
      pendingCommitRef.current = true;
      if (debounceTimerRef.current != null) window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        debounceTimerRef.current = null;
        if (!pendingCommitRef.current) return;
        flushCommit(value);
      }, debounceMs);
    },
    [debounceMs, flushCommit]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current != null) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const next = boundsFromStrings(latestPropsRef.current.minValue, latestPropsRef.current.maxValue, sliderMin, sliderMax);
    // Unset → full span so the thumbs start at the extremes.
    const unset = !latestPropsRef.current.minValue.trim() && !latestPropsRef.current.maxValue.trim();
    setDraft(unset ? [sliderMin, sliderMax] : next);
  }, [open, sliderMin, sliderMax]);

  const propsUnset = !minValue.trim() && !maxValue.trim();
  const closedBounds = boundsFromStrings(minValue, maxValue, sliderMin, sliderMax);
  const triggerContent = open
    ? formatPair(draft[0], draft[1], fullRangeMeansUnset && draft[0] <= sliderMin && draft[1] >= sliderMax)
    : formatPair(closedBounds[0], closedBounds[1], propsUnset);

  const previewUnset = fullRangeMeansUnset && draft[0] <= sliderMin && draft[1] >= sliderMax;
  const previewLabel = previewUnset ? emptyLabel : `${formatBound(draft[0])} – ${formatBound(draft[1])}`;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) flushCommit(draftRef.current);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" aria-label={ariaLabel} className={cn(sentenceBlankTriggerClasses, className)} onClick={(event) => event.stopPropagation()}>
          <span className="inline-flex items-center">{triggerContent}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3 p-3" align="start" sideOffset={6} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
          <span>{previewLabel}</span>
        </div>
        <RangeSlider
          aria-label={ariaLabel}
          value={draft}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          onValueChange={(next) => {
            setDraft(next);
            draftRef.current = next;
            scheduleCommit(next);
          }}
          onValueCommit={(next) => {
            setDraft(next);
            draftRef.current = next;
            flushCommit(next);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Alias for `SentenceRangeBlank`. */
export const SentenceMinMaxBlank = SentenceRangeBlank;
