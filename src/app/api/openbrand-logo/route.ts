import { NextRequest, NextResponse } from "next/server";
import { cleanDomain } from "../../../lib/company-info";
import { extractBrandAssets, type LogoAsset } from "openbrand";

export const runtime = "nodejs";

/** Milliseconds a positive OpenBrand extraction stays cached in memory. */
const POSITIVE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
/** Milliseconds a failed extraction stays cached to avoid retry storms. */
const NEGATIVE_TTL_MS = 60 * 60 * 1000; // 1 hour
/** Hard timeout for each extraction attempt. */
const EXTRACTION_TIMEOUT_MS = 8000;

interface CachedLogo {
  url: string;
  ts: number;
}

const positiveCache = new Map<string, CachedLogo>();
const negativeCache = new Map<string, number>();
const inFlight = new Map<string, Promise<string | null>>();

function isAbsoluteHttpOrHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeDomain(domain: string | null): string | null {
  return cleanDomain(domain) || cleanDomain(decodeURIComponent(domain || ""));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise.then((value) => {
      clearTimeout(timeout);
      return value;
    }),
    new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () => reject(new Error("OpenBrand extraction timed out")));
    }),
  ]);
}

/**
 * Filters candidates to ensure they are accessible http/https URLs and meet minimum quality thresholds.
 * High-res favicons (>=64px or vector SVGs) are allowed; tiny favicons (<64px) are rejected so
 * the client falls back to higher-quality upstream services (Google Favicon V2, etc.).
 */
export function isEligibleLogo(logo: LogoAsset): boolean {
  if (!logo.url || !isAbsoluteHttpOrHttpsUrl(logo.url)) {
    return false;
  }

  const isSvg = logo.type === "svg" || /\.svg(\?|$)/i.test(logo.url);
  const isFavicon = logo.type === "favicon" || /\.ico(\?|$)/i.test(logo.url);
  const width = logo.resolution?.width;
  const height = logo.resolution?.height;

  if (isFavicon) {
    if (isSvg) return true;
    if (width !== undefined && width >= 64) return true;
    return false;
  }

  // Non-favicons: reject tiny slivers or thumbnails if dimensions are known
  if (!isSvg && width !== undefined && height !== undefined && width < 32 && height < 32) {
    return false;
  }

  return true;
}

/**
 * Scores a candidate logo asset.
 * Prioritizes near-square assets (apple-touch-icons, crisp SVGs, and square icons) that render best
 * in square avatar slots, while still gracefully rewarding high-fidelity wide wordmarks when squarer marks
 * are not available.
 */
export function scoreLogoCandidate(logo: LogoAsset): number {
  const isSvg = logo.type === "svg" || /\.svg(\?|$)/i.test(logo.url);
  const width = logo.resolution?.width ?? (isSvg ? 256 : 0);
  const height = logo.resolution?.height ?? (isSvg ? 256 : 0);
  const ar = logo.resolution?.aspect_ratio ?? (width > 0 && height > 0 ? width / height : 1.0);

  let score = 0;

  // 1. Aspect ratio fit for a square container (ideal is ~1.0)
  if (ar >= 0.8 && ar <= 1.25) {
    score += 60; // Near-perfect square (ideal for square slots)
  } else if (ar >= 0.65 && ar <= 1.5) {
    score += 40; // Close to square
  } else if (ar >= 0.5 && ar <= 2.2) {
    score += 20; // Moderate rectangle
  } else if (ar > 2.2 && ar <= 4.0) {
    score -= 10; // Wide wordmark - usable if squarer icon is not present
  } else if (ar > 4.0 && ar <= 6.5) {
    score -= 25; // Very wide wordmark
  } else {
    score -= 50; // Extreme aspect ratio
  }

  // 2. Vector and resolution quality
  if (isSvg) {
    score += 80; // Vector graphics scale losslessly
  } else {
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);
    if (minDim >= 180) {
      score += 70; // High-res retina icon (e.g. 180x180 apple-touch-icon)
    } else if (minDim >= 120) {
      score += 55;
    } else if (minDim >= 64) {
      score += 40;
    } else if (maxDim >= 120) {
      score += 30; // Wide wordmark with decent horizontal resolution
    } else if (maxDim >= 64) {
      score += 20;
    } else {
      score += 5;
    }
  }

  // 3. Asset type semantics
  switch (logo.type) {
    case "apple-touch-icon":
      score += 30; // Specifically designed for square app tiles/icons
      break;
    case "icon":
      score += 25;
      break;
    case "svg":
      score += 20;
      break;
    case "logo":
      score += 15;
      break;
    case "img":
      score += 10;
      break;
    case "favicon":
      // Only high-res favicons (>=64px or SVG) pass eligibility
      score += 10;
      break;
    default:
      break;
  }

  return score;
}

export function selectBestLogo(logos: LogoAsset[]): string | null {
  const eligible = logos.filter(isEligibleLogo);
  if (eligible.length === 0) {
    return null;
  }

  const scored = eligible.map((logo, index) => ({
    logo,
    score: scoreLogoCandidate(logo),
    index,
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const aSvg = a.logo.type === "svg" || /\.svg(\?|$)/i.test(a.logo.url);
    const bSvg = b.logo.type === "svg" || /\.svg(\?|$)/i.test(b.logo.url);
    if (aSvg !== bSvg) {
      return bSvg ? 1 : -1;
    }
    const aWidth = a.logo.resolution?.width ?? 0;
    const bWidth = b.logo.resolution?.width ?? 0;
    if (bWidth !== aWidth) {
      return bWidth - aWidth;
    }
    return a.index - b.index;
  });

  return scored[0]?.logo.url ?? null;
}

async function extractBestLogo(domain: string): Promise<string | null> {
  const result = await withTimeout(extractBrandAssets(`https://${domain}`), EXTRACTION_TIMEOUT_MS);
  if (!result.ok || !result.data?.logos?.length) {
    return null;
  }

  return selectBestLogo(result.data.logos);
}

export async function GET(request: NextRequest) {
  const domain = sanitizeDomain(request.nextUrl.searchParams.get("domain"));

  if (!domain) {
    return NextResponse.json({ error: "Missing or invalid domain parameter" }, { status: 400 });
  }

  const now = Date.now();

  const negativeTs = negativeCache.get(domain);
  if (negativeTs && now - negativeTs < NEGATIVE_TTL_MS) {
    return new NextResponse("No usable logo found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
    });
  }

  const cached = positiveCache.get(domain);
  if (cached && now - cached.ts < POSITIVE_TTL_MS) {
    return NextResponse.redirect(cached.url, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  let promise = inFlight.get(domain);
  if (!promise) {
    promise = extractBestLogo(domain);
    inFlight.set(domain, promise);
    promise
      .then((url) => {
        if (url) {
          positiveCache.set(domain, { url, ts: now });
          negativeCache.delete(domain);
        } else {
          negativeCache.set(domain, now);
        }
      })
      .catch(() => {
        negativeCache.set(domain, now);
      })
      .finally(() => {
        inFlight.delete(domain);
      });
  }

  try {
    const url = await promise;
    if (!url) {
      return new NextResponse("No usable logo found", {
        status: 404,
        headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
      });
    }
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Failed to extract logo", {
      status: 404,
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
    });
  }
}
