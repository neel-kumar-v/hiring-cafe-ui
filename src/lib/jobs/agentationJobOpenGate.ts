/**
 * Dev-only: while Agentation is mounted, require a double-click to open job
 * dialogs so single clicks can land annotations on cards.
 *
 * Escape hatch: localStorage.setItem("hc-job-open-single-click", "1")
 */

const ESCAPE_KEY = "hc-job-open-single-click";

type PointerState = { detail: number; at: number };

let pointer: PointerState = { detail: 1, at: 0 };
let installed = false;

export function installAgentationJobOpenGate(): void {
  if (installed || typeof document === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;
  installed = true;
  document.addEventListener(
    "click",
    (event) => {
      pointer = { detail: event.detail, at: performance.now() };
    },
    true
  );
}

function prefersSingleClick(): boolean {
  try {
    return window.localStorage.getItem(ESCAPE_KEY) === "1";
  } catch {
    return false;
  }
}

function agentationIsMounted(): boolean {
  return Boolean(document.querySelector("[data-agentation-root]"));
}

/** Returns false when a single click should not open a job preview (Agentation annotate). */
export function shouldOpenJobFromUserClick(): boolean {
  if (process.env.NODE_ENV !== "development") return true;
  if (typeof document === "undefined") return true;
  if (!agentationIsMounted()) return true;
  if (prefersSingleClick()) return true;
  // Keyboard / programmatic opens aren't tied to a fresh click
  if (performance.now() - pointer.at > 120) return true;
  return pointer.detail >= 2;
}
