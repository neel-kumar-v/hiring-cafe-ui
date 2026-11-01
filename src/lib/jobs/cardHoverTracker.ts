"use client";

/**
 * Shared tracker for "is any job card on the board hovered?".
 *
 * Job cards share CSS grid row height, so ANY card's hover-driven expansion
 * (max-height transitions on header or requirements) transiently stretches
 * every sibling in the row. Skill chips reveal in an overlay and don't affect
 * row height. Resting-layout decisions — e.g.
 * CardTechnicalTools choosing how many chip rows to show while idle — must only
 * be committed from settled, non-hovered layout. Measuring a sibling's
 * transient hover stretch would permanently unlock extra chips in it (expand
 * cascade: one card expands → siblings show more → after unhover nothing goes
 * back because those siblings now prop the row up).
 *
 * Document-level capture listeners are installed lazily, and hover state is
 * reconciled in a rAF batch, so per-card cost stays flat. Consumers gate
 * measurement ticks with `isJobCardHoverSettled()` and re-commit once via
 * `onJobCardHoverSettled()` when the board is pointer-free again.
 */

const HOVER_CARD_SELECTOR = '[data-job-card="true"]';

/** Hover expansions transition over 750ms (requirements/header max-height) plus headroom for the settle window. */
export const JOB_CARD_HOVER_SETTLE_MS = 900;

const hoveredCards = new Set<Element>();
let installed = false;
let recheckRaf: number | null = null;
let settleTimer: ReturnType<typeof setTimeout> | null = null;
let lastUnhoverAt = -Infinity;
const settleListeners = new Set<() => void>();

function reconcileHoveredCards() {
  recheckRaf = null;
  let changed = false;
  for (const card of hoveredCards) {
    // Prune cards the pointer has left, or that were removed from the DOM
    // mid-hover (a stale entry would keep the gate closed forever).
    if (!card.isConnected || !(card as HTMLElement).matches(":hover")) {
      hoveredCards.delete(card);
      changed = true;
    }
  }
  if (changed && hoveredCards.size === 0) {
    markBoardUnhovered();
  }
}

function markBoardUnhovered() {
  lastUnhoverAt = performance.now();
  if (settleTimer !== null) clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    settleTimer = null;
    // Iterate the live set: unsubscribes during notification are handled by
    // Set iterators (removed entries are skipped, additions are visited).
    for (const listener of settleListeners) listener();
  }, JOB_CARD_HOVER_SETTLE_MS);
}

function ensureHoverTracking() {
  if (installed || typeof document === "undefined") return;
  installed = true;
  const handlePointerEvent = (event: PointerEvent) => {
    const target = event.target as Element | null;
    const card = target && typeof target.closest === "function" ? target.closest(HOVER_CARD_SELECTOR) : null;
    if (card) {
      hoveredCards.add(card);
    }
    // Reconcile on every pointer move burst (not just card hits): the pointer
    // may have left a card through an element whose pointerout was missed.
    if (recheckRaf === null) {
      recheckRaf = requestAnimationFrame(reconcileHoveredCards);
    }
  };
  document.addEventListener("pointerover", handlePointerEvent, true);
  document.addEventListener("pointerout", handlePointerEvent, true);
}

/**
 * Seed the tracker with an element that may already be hovered before this
 * page observed any pointer event (e.g. the pointer rests on a card while card
 * effects mount). Idempotent.
 */
export function markElementHoveredIfHovered(element: Element): void {
  ensureHoverTracking();
  if (element.isConnected && (element as HTMLElement).matches(":hover")) {
    hoveredCards.add(element);
    if (recheckRaf === null) {
      recheckRaf = requestAnimationFrame(reconcileHoveredCards);
    }
  }
}

/** True while any job card is hovered. */
export function isAnyJobCardHovered(): boolean {
  ensureHoverTracking();
  return hoveredCards.size > 0;
}

/**
 * True when the board is pointer-free and settled: no card is hovered and at
 * least `JOB_CARD_HOVER_SETTLE_MS` has passed since the last card stopped
 * being hovered, i.e. shared-row hover expansions have finished collapsing.
 */
export function isJobCardHoverSettled(): boolean {
  ensureHoverTracking();
  return hoveredCards.size === 0 && performance.now() - lastUnhoverAt >= JOB_CARD_HOVER_SETTLE_MS;
}

/**
 * Run `listener` once the board has been free of hover for
 * `JOB_CARD_HOVER_SETTLE_MS` (i.e. once layout measured from rest is
 * trustworthy again). Subscribing while a settle window is already open still
 * delivers one callback for that window.
 */
export function onJobCardHoverSettled(listener: () => void): () => void {
  ensureHoverTracking();
  settleListeners.add(listener);
  let lateWindowTimer: ReturnType<typeof setTimeout> | null = null;
  if (hoveredCards.size === 0) {
    const remaining = JOB_CARD_HOVER_SETTLE_MS - (performance.now() - lastUnhoverAt);
    if (remaining > 0) lateWindowTimer = setTimeout(listener, remaining);
  }
  return () => {
    settleListeners.delete(listener);
    if (lateWindowTimer !== null) clearTimeout(lateWindowTimer);
  };
}
