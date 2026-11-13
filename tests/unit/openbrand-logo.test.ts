import assert from "node:assert/strict";
import test from "node:test";
import { isEligibleLogo, scoreLogoCandidate, selectBestLogo } from "../../src/app/api/openbrand-logo/route";
import type { LogoAsset } from "openbrand";

test("isEligibleLogo filters URLs and rejects tiny favicons", () => {
  // Valid high-res favicon is eligible
  assert.equal(
    isEligibleLogo({
      url: "https://images.stripeassets.com/favicon.svg",
      type: "favicon",
      resolution: { width: 512, height: 512, aspect_ratio: 1 },
    }),
    true
  );

  // High-res raster favicon >= 64px is eligible
  assert.equal(
    isEligibleLogo({
      url: "https://ea.com/favicon.ico",
      type: "favicon",
      resolution: { width: 256, height: 256, aspect_ratio: 1 },
    }),
    true
  );

  // Tiny favicon < 64px is rejected so client falls back to Google Favicon V2
  assert.equal(
    isEligibleLogo({
      url: "https://example.com/favicon.ico",
      type: "favicon",
      resolution: { width: 32, height: 32, aspect_ratio: 1 },
    }),
    false
  );
  assert.equal(
    isEligibleLogo({
      url: "https://example.com/favicon.ico",
      type: "favicon",
      resolution: { width: 16, height: 16, aspect_ratio: 1 },
    }),
    false
  );

  // Invalid, relative, or non-http URLs are rejected
  assert.equal(
    isEligibleLogo({
      url: "/relative/logo.png",
      type: "logo",
    }),
    false
  );
  assert.equal(
    isEligibleLogo({
      url: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
      type: "svg",
    }),
    false
  );
});

test("scoreLogoCandidate scores near-square assets higher than wide wordmarks", () => {
  const squareIcon: LogoAsset = {
    url: "https://example.com/icon.png",
    type: "apple-touch-icon",
    resolution: { width: 180, height: 180, aspect_ratio: 1.0 },
  };

  const wideWordmark: LogoAsset = {
    url: "https://example.com/wordmark.png",
    type: "logo",
    resolution: { width: 600, height: 100, aspect_ratio: 6.0 },
  };

  const squareScore = scoreLogoCandidate(squareIcon);
  const wideScore = scoreLogoCandidate(wideWordmark);

  assert.ok(squareScore > wideScore, "Square apple-touch-icon must score higher than wide wordmark");
});

test("selectBestLogo prefers square apple-touch-icon over giant wide wordmarks", () => {
  const logos: LogoAsset[] = [
    {
      url: "https://example.com/banner-wordmark.png",
      type: "img",
      resolution: { width: 1200, height: 200, aspect_ratio: 6.0 },
    },
    {
      url: "https://example.com/apple-icon.png",
      type: "apple-touch-icon",
      resolution: { width: 180, height: 180, aspect_ratio: 1.0 },
    },
  ];

  assert.equal(selectBestLogo(logos), "https://example.com/apple-icon.png");
});

test("selectBestLogo prefers near-square SVG over wide wordmark", () => {
  const logos: LogoAsset[] = [
    {
      url: "https://example.com/wide-logo.svg",
      type: "logo",
      resolution: { width: 400, height: 80, aspect_ratio: 5.0 },
    },
    {
      url: "https://example.com/square-icon.svg",
      type: "icon",
      resolution: { width: 64, height: 64, aspect_ratio: 1.0 },
    },
  ];

  assert.equal(selectBestLogo(logos), "https://example.com/square-icon.svg");
});

test("selectBestLogo selects wide SVG wordmark when no squarer mark is present", () => {
  const logos: LogoAsset[] = [
    {
      url: "https://www.boozallen.com/assets/home/images/homepage/bah-logo-trademark.svg",
      type: "logo",
      resolution: { width: 192.6, height: 30, aspect_ratio: 6.42 },
    },
    {
      // Low-res favicon should be disqualified
      url: "https://www.boozallen.com/favicon.ico",
      type: "favicon",
      resolution: { width: 32, height: 32, aspect_ratio: 1 },
    },
  ];

  assert.equal(selectBestLogo(logos), "https://www.boozallen.com/assets/home/images/homepage/bah-logo-trademark.svg");
});

test("selectBestLogo selects Trust Wallet square icon over wide nav wordmark", () => {
  const logos: LogoAsset[] = [
    {
      url: "https://trustwallet.com/favicon.ico",
      type: "favicon",
      resolution: { width: 256, height: 256, aspect_ratio: 1 },
    },
    {
      url: "https://trustwallet.com/icon.svg",
      type: "favicon",
      resolution: { width: 39, height: 43, aspect_ratio: 0.91 },
    },
    {
      url: "https://trustwallet.com/apple-icon.png",
      type: "apple-touch-icon",
      resolution: { width: 39, height: 43, aspect_ratio: 0.91 },
    },
    {
      url: "https://trustwallet.com/images/home-v2/nav-logo-trust.svg",
      alt: "Trust Wallet",
      type: "logo",
      resolution: { width: 102.776, height: 27.7923, aspect_ratio: 3.7 },
    },
  ];

  // Should select the square vector icon (icon.svg) or high-res icon, not the wide 3.7:1 nav logo
  const best = selectBestLogo(logos);
  assert.notEqual(best, "https://trustwallet.com/images/home-v2/nav-logo-trust.svg");
  assert.equal(best, "https://trustwallet.com/icon.svg");
});

test("selectBestLogo returns null when no eligible logos exist", () => {
  assert.equal(selectBestLogo([]), null);

  // All tiny favicons
  const tinyLogos: LogoAsset[] = [
    {
      url: "https://example.com/favicon.ico",
      type: "favicon",
      resolution: { width: 16, height: 16, aspect_ratio: 1 },
    },
    {
      url: "https://example.com/favicon-32x32.png",
      type: "favicon",
      resolution: { width: 32, height: 32, aspect_ratio: 1 },
    },
  ];
  assert.equal(selectBestLogo(tinyLogos), null);
});
