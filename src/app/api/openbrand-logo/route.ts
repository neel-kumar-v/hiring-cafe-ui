import { NextRequest, NextResponse } from "next/server";
import { cleanDomain } from "../../../lib/company-info";
import { extractBrandAssets } from "openbrand";

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

async function extractBestLogo(domain: string): Promise<string | null> {
  const result = await withTimeout(extractBrandAssets(`https://${domain}`), EXTRACTION_TIMEOUT_MS);
  if (!result.ok || !result.data?.logos?.length) {
    return null;
  }

  const logos = result.data.logos.filter((logo) => logo.url && isAbsoluteHttpOrHttpsUrl(logo.url));
  if (logos.length === 0) {
    return null;
  }

  const nonFaviconLogos = logos.filter((logo) => logo.type !== "favicon");
  let candidate: (typeof logos)[number] | undefined;

  if (nonFaviconLogos.length > 0) {
    candidate = nonFaviconLogos.reduce((best, current) => {
      const bestWidth = best.resolution?.width ?? 0;
      const currentWidth = current.resolution?.width ?? 0;
      return currentWidth > bestWidth ? current : best;
    });
  } else {
    const eligibleFavicons = logos.filter((logo) => (logo.resolution?.width ?? 0) >= 64);
    candidate = eligibleFavicons.reduce<(typeof logos)[number] | undefined>((best, current) => {
      if (!best) return current;
      const bestWidth = best.resolution?.width ?? 0;
      const currentWidth = current.resolution?.width ?? 0;
      return currentWidth > bestWidth ? current : best;
    }, undefined);
  }

  return candidate?.url ?? null;
}

export async function GET(request: NextRequest) {
  const domain = sanitizeDomain(request.nextUrl.searchParams.get("domain"));

  if (!domain) {
    return NextResponse.json({ error: "Missing or invalid domain parameter" }, { status: 400 });
  }

  const now = Date.now();

  const negativeTs = negativeCache.get(domain);
  if (negativeTs && now - negativeTs < NEGATIVE_TTL_MS) {
    return new NextResponse("No usable logo found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const cached = positiveCache.get(domain);
  if (cached && now - cached.ts < POSITIVE_TTL_MS) {
    return NextResponse.redirect(cached.url, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
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
      return new NextResponse("No usable logo found", { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      },
    });
  } catch {
    return new NextResponse("Failed to extract logo", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}
