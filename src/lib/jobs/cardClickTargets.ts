"use client";

/**
 * Interactive chrome inside a job card that must never open the job dialog.
 *
 * Cards open the detail dialog from a single click on their body, so every
 * nested control (role chips, Apply Now, Save, overflow menu, stats) has to
 * win that click. Checking the event target is a stronger guarantee than
 * relying on each control remembering `stopPropagation`.
 */
const INTERACTIVE_CARD_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "[role='button']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='checkbox']",
  "[role='option']",
  "[role='switch']",
  "[role='tab']",
  "[data-card-action='true']",
  "[data-radix-popper-content-wrapper]",
  "[data-slot='dropdown-menu-content']",
].join(",");

/** True when the click landed on (or inside) interactive card chrome. */
export function isInteractiveCardTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object" || !("closest" in target)) return false;
  return (target as Element).closest(INTERACTIVE_CARD_SELECTOR) !== null;
}
