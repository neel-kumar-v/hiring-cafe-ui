import test from "node:test";
import assert from "node:assert/strict";

/**
 * Mirror of useResizableWidth collapse threshold calculation:
 * collapseThreshold: collapseThreshold ?? (min + (collapsedWidth ?? 0)) / 2
 */
function getCollapseThreshold(min: number, collapsedWidth: number = 0, explicitThreshold?: number): number {
  return explicitThreshold ?? (min + collapsedWidth) / 2;
}

test("AppSidebar collapse threshold is midpoint between min and ribbon width", () => {
  // AppSidebar: min = 200, collapsedWidth = 56 (ribbon)
  const threshold = getCollapseThreshold(200, 56);
  assert.equal(threshold, 128);
  // Distance to collapse past min: 200 - 128 = 72px
  assert.equal(200 - threshold, 72);
});

test("ChatPanel collapse threshold is midpoint between min and 0 (hidden)", () => {
  // ChatPanel: min = 320, collapsedWidth = 0 (hidden)
  const threshold = getCollapseThreshold(320, 0);
  assert.equal(threshold, 160);
  // Distance to collapse past min: 320 - 160 = 160px
  assert.equal(320 - threshold, 160);
});

test("Projected width calculation for edge left collapses when dragged right past threshold", () => {
  const edge: "left" | "right" = "left";
  const startWidth = 400;
  const startX = 1200;
  const min = 320;
  const colThresh = getCollapseThreshold(min, 0);

  function getProjectedWidth(clientX: number) {
    const delta = edge === "right" ? clientX - startX : startX - clientX;
    return startWidth + delta;
  }

  // Dragging right increases clientX: delta is negative (inward)
  // ClientX = 1280 -> delta = -80 -> width = 320 (exact min)
  assert.equal(getProjectedWidth(1280), 320);

  // ClientX = 1350 -> delta = -150 -> projected = 250 (below min, but >= colThresh 160 -> clamped at min 320)
  const clampedWidth = getProjectedWidth(1350);
  assert.equal(clampedWidth, 250);
  assert.ok(clampedWidth < min && clampedWidth >= colThresh);

  // ClientX = 1450 -> delta = -250 -> projected = 150 (< colThresh 160 -> auto-hide / collapse!)
  const collapsingWidth = getProjectedWidth(1450);
  assert.equal(collapsingWidth, 150);
  assert.ok(collapsingWidth < colThresh);
});
