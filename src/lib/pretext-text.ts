/**
 * Caching layer over `@chenglou/pretext` (text measurement & layout without
 * DOM reflow). Sidebar/chat drag-resize shuffles job-card widths every frame,
 * and text-dependent layout work that used to read `scrollHeight` per card
 * per frame now runs here as pure JS:
 *
 * - `prepare(text, font)` is the expensive snapshot (glyph widths, break
 *   data) and is cached once per `font + "\u0000" + text`.
 * - Width/line queries on a prepared text are cheap and re-run whenever the
 *   container width changes, with no DOM measurement in the loop.
 * - Font strings are expected to come from `getComputedStyle` captured once
 *   per component effect (never per frame) so the cache key matches what the
 *   browser renders.
 */

import { measureNaturalWidth, prepare, type PreparedText } from "@chenglou/pretext";

interface PreparedEntry {
  prepared: PreparedText;
  naturalWidth: number;
}

const PREPARED_CACHE_LIMIT = 4096;
const preparedCache = new Map<string, PreparedEntry>();

/** Natural (single-run, unwrapped) width of `text` set in `font`, in px. */
export function getNaturalTextWidth(text: string, font: string): number {
  const key = `${font}\u0000${text}`;
  const cached = preparedCache.get(key);
  if (cached) return cached.naturalWidth;

  const prepared = prepare(text, font);
  const entry: PreparedEntry = {
    prepared,
    naturalWidth: measureNaturalWidth(prepared),
  };

  if (preparedCache.size >= PREPARED_CACHE_LIMIT) {
    // Keep the cache bounded; re-preparing a handful of texts is cheap
    // compared to per-frame DOM reads.
    preparedCache.clear();
  }
  preparedCache.set(key, entry);
  return entry.naturalWidth;
}

/**
 * Greedy wrap simulation for a row of shrink-0, nowrap flex items, mirroring
 * how the browser packs them (used to estimate how many rows a chip list
 * forms at a given container width). Returns 0 when the width is unknown so
 * callers can fall back to a DOM measurement.
 */
export function countWrapRows(itemWidths: readonly number[], containerWidth: number, gapPx: number): number {
  if (itemWidths.length === 0 || !(containerWidth > 0)) return 0;

  let rows = 1;
  let usedWidth = itemWidths[0];
  for (let index = 1; index < itemWidths.length; index += 1) {
    const itemWidth = itemWidths[index];
    if (usedWidth + gapPx + itemWidth > containerWidth) {
      rows += 1;
      usedWidth = itemWidth;
    } else {
      usedWidth += gapPx + itemWidth;
    }
  }
  return rows;
}
