import { expect, test } from "@playwright/test";

/**
 * Perf tests are intentionally "soft" by default because Convex roundtrip time
 * depends on local network and backend load. To enforce hard thresholds, set:
 * - PERF_MAX_MS=...
 */

test("@perf job details: time to description render", async ({ page, baseURL }) => {
  await page.goto(baseURL ?? "http://localhost:3000");

  // Wait for at least one job card to render.
  const firstCard = page.locator("[data-job-card='true']").first();
  await expect(firstCard).toBeVisible();

  // Click the first card and measure until the job description element renders non-empty.
  const t0 = Date.now();
  await firstCard.click();

  const jobDescription = page.locator("#job-description");
  await expect(jobDescription).toBeVisible();
  await expect(jobDescription).not.toHaveText("", { timeout: 30_000 });

  const elapsed = Date.now() - t0;
  test.info().annotations.push({ type: "perf", description: `time_to_description_ms=${elapsed}` });

  const maxMsRaw = process.env.PERF_MAX_MS;
  if (maxMsRaw) {
    const maxMs = Number.parseInt(maxMsRaw, 10);
    expect(elapsed).toBeLessThan(maxMs);
  }
});

