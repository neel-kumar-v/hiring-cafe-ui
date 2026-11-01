export const formatCompanyName = (companyName: string) => {
  if (!companyName) return "(No Company Name Listed)";
  return companyName.replace(/\s*\(.*?\)\s*/g, " ").trim();
};

export const getCompanyAbbreviation = (companyName: string) => {
  if (!companyName) return "";
  return formatCompanyName(companyName)
    .split(" ")
    .map((word) => {
      if (!word) return "";
      let abbrev = word[0];
      abbrev += word
        .slice(1)
        .split("")
        .filter((c) => c >= "A" && c <= "Z")
        .join("");
      return abbrev;
    })
    .join("")
    .slice(0, 4);
};

export const formatCompanyWebsite = (website: string | null | undefined): string => {
  if (!website) return "#";
  return website.startsWith("http") ? website : `https://${website}`;
};

/** Hostname for favicon services (e.g. `liebherr.com` from `https://www.liebherr.com/careers`). */
export const cleanDomain = (domain: string | null | undefined): string | null => {
  if (!domain) return null;
  const trimmed = domain.trim();
  if (
    !trimmed ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "#" ||
    trimmed === "/" ||
    trimmed.toLowerCase() === "localhost" ||
    trimmed === "127.0.0.1"
  ) {
    return null;
  }

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
    const urlStr = hasScheme ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlStr);
    let host = parsed.hostname.toLowerCase();
    host = host.split(":")[0];
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }
    // Filter out localhost, IP loopback, or slugs without a dot (e.g. "lockheed-martin")
    if (!host || host === "localhost" || host === "127.0.0.1" || !host.includes(".")) {
      return null;
    }
    // Basic domain validation: labels followed by valid TLD of at least 2 characters
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return null;
    }
    return host;
  } catch {
    let host = trimmed
      .toLowerCase()
      .replace(/^[a-z]+:\/\//i, "")
      .split(/[/?#:]/)[0]
      .replace(/^www\./, "")
      .trim();
    if (!host || host === "localhost" || host === "127.0.0.1" || !host.includes(".")) {
      return null;
    }
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return null;
    }
    return host;
  }
};

export const extractDomainFromCompanyWebsite = (website: string | null | undefined): string | null => {
  return cleanDomain(website);
};

export const companyFaviconUrl = (domain: string, sizePx: number): string =>
  `https://s2.googleusercontent.com/s2/favicons?domain=${encodeURIComponent(cleanDomain(domain) || domain)}&sz=${sizePx}`;

/**
 * Google Favicon V2 resolves high-resolution icons (up to 256px) and Apple Touch Icons directly from domains.
 * Provides high-fidelity vector/JPEG/PNG rendering without requiring external API keys.
 */
export const companyGoogleFaviconV2Url = (domain: string, sizePx: number = 128): string =>
  `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${encodeURIComponent(cleanDomain(domain) || domain)}&size=${sizePx}`;

/**
 * Unavatar.io resolves crisp vector SVGs, Apple Touch Icons (180px+),
 * OpenGraph images, and manifest icons directly from the domain without API keys.
 * `fallback=false` ensures a 404 is returned if not found so the client can fall back.
 */
export const companyUnavatarUrl = (domain: string): string => `https://unavatar.io/${encodeURIComponent(cleanDomain(domain) || domain)}?fallback=false`;

export const companyBrandfetchUrl = (domain: string, clientId: string, type: "logo" | "icon" = "logo"): string =>
  `https://cdn.brandfetch.io/${encodeURIComponent(cleanDomain(domain) || domain)}/${type}?c=${encodeURIComponent(clientId)}`;

export const companyClearbitUrl = (domain: string, baseUrl = "https://logo.clearbit.com"): string =>
  `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(cleanDomain(domain) || domain)}`;

export const companyDuckDuckGoFaviconUrl = (domain: string): string => `https://icons.duckduckgo.com/ip3/${encodeURIComponent(cleanDomain(domain) || domain)}.ico`;

/** Detects URLs that point to low-resolution favicon endpoints or icon files. */
export const isFaviconServiceUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const raw = url.trim().toLowerCase();
  return raw.includes("icons.duckduckgo.com") || raw.includes("s2.googleusercontent.com/s2/favicons") || /\.ico(\?|$)/i.test(raw) || /\/favicon(\.[a-z]+)?(\?|$)/i.test(raw);
};

export interface LogoExpandableOptions {
  /** Minimum pixel width/height required to consider an image expandable (e.g. 64). */
  minDimension?: number;
  /** Minimum aspect ratio (width/height) to prevent pillarboxing (default 0.75). */
  minAspectRatio?: number;
  /** Maximum aspect ratio (width/height) to prevent letterboxing (default 1.35). */
  maxAspectRatio?: number;
  /** Image source URL to detect vector SVGs or favicon service fallbacks. */
  src?: string;
  /** Force SVG vector handling where pixel dimension constraints are relaxed. */
  isSvg?: boolean;
  /** If true, allows favicon service URLs to qualify if they satisfy dimensions / aspect ratio. Defaults to false. */
  allowFavicons?: boolean;
}

/**
 * Validates whether a loaded image can cleanly expand and fill a square logo slot.
 * Rejects failed decodes (0x0), letterboxed/pillarboxed aspect ratios, and tiny favicons.
 */
export const isExpandableLogo = (width: number, height: number, options?: LogoExpandableOptions): boolean => {
  if (!width || !height || width <= 0 || height <= 0 || !Number.isFinite(width) || !Number.isFinite(height)) {
    return false;
  }

  const minAspectRatio = options?.minAspectRatio ?? 0.75;
  const maxAspectRatio = options?.maxAspectRatio ?? 1.35;
  const aspectRatio = width / height;

  if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio) {
    return false;
  }

  const isSvg = options?.isSvg || (options?.src ? /\.svg(\?|$)/i.test(options.src) || options.src.startsWith("data:image/svg+xml") : false);

  if (!isSvg) {
    const minDimension = options?.minDimension ?? 64;
    if (width < minDimension || height < minDimension) {
      return false;
    }
  }

  if (!options?.allowFavicons && options?.src && isFaviconServiceUrl(options.src)) {
    return false;
  }

  return true;
};

export interface CompanyLogoSourcesInput {
  image_url?: string | null;
  canonical_domain?: string | null;
  website?: string | null;
}

export interface CompanyLogoSourcesOptions {
  /** If false, excludes low-resolution favicon services (Google Favicon, DuckDuckGo). Defaults to true. */
  includeFavicons?: boolean;
}

/**
 * Builds an ordered list of image candidates for high-fidelity rendering.
 * Priority order:
 * 1. Direct explicit image asset (career page/OG/DB scraped logo)
 * 2. Brandfetch (if NEXT_PUBLIC_BRANDFETCH_CLIENT_ID is configured)
 * 3. Clearbit (if NEXT_PUBLIC_CLEARBIT_LOGO_URL or NEXT_PUBLIC_ENABLE_CLEARBIT is set)
 * 4. Logo.dev (if NEXT_PUBLIC_LOGO_DEV_TOKEN is configured)
 * 5. Google Favicon V2 (high-fidelity zero-auth resolver up to 256px, reliable non-unavatar candidate)
 * 6. Unavatar (free zero-secret SVG/Apple-Touch-Icon resolver, mid/low priority)
 * 7. DuckDuckGo Favicon service (reliable favicon fallback fetching site's genuine favicon.ico)
 * 8. Google Favicon service (universal zero-auth fallback favicon)
 * 9. Secondary website domain if distinct from canonical domain
 */
export const getCompanyLogoSources = (companyData: CompanyLogoSourcesInput, sizePx: number = 256, options?: CompanyLogoSourcesOptions): string[] => {
  const chain: string[] = [];
  const includeFavicons = options?.includeFavicons ?? true;

  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const trimmed = url.trim();
    if (trimmed.length === 0 || trimmed === "null" || trimmed === "undefined" || trimmed === "#") {
      return false;
    }
    if (!includeFavicons && isFaviconServiceUrl(trimmed)) {
      return false;
    }
    return true;
  };

  // 1. Direct scraped/stored company image_url
  if (isValidUrl(companyData.image_url)) {
    chain.push(companyData.image_url!.trim());
  }

  const primaryDomain = cleanDomain(companyData.canonical_domain) || extractDomainFromCompanyWebsite(companyData.website);

  if (primaryDomain) {
    // 2. Brandfetch (if client ID is provided)
    const brandfetchId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
    if (brandfetchId) {
      chain.push(companyBrandfetchUrl(primaryDomain, brandfetchId, "icon"));
      chain.push(companyBrandfetchUrl(primaryDomain, brandfetchId, "logo"));
    }

    // 3. Clearbit (if enabled or custom proxy configured)
    const clearbitUrl = process.env.NEXT_PUBLIC_CLEARBIT_LOGO_URL;
    if (clearbitUrl) {
      chain.push(companyClearbitUrl(primaryDomain, clearbitUrl));
    } else if (process.env.NEXT_PUBLIC_ENABLE_CLEARBIT === "true") {
      chain.push(companyClearbitUrl(primaryDomain));
    }

    // 4. Logo.dev (if keyed via NEXT_PUBLIC_LOGO_DEV_TOKEN)
    const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
    if (logoDevToken) {
      chain.push(`https://img.logo.dev/${encodeURIComponent(primaryDomain)}?token=${logoDevToken}&size=${sizePx}`);
    }

    // 5. Google Favicon V2: high-fidelity, zero-auth resolver providing crisp vector/JPEG/PNG brand logos (up to 256px)
    // Always provided in the primary candidate chain (even with includeFavicons: false)
    chain.push(companyGoogleFaviconV2Url(primaryDomain, sizePx));

    // 6. Unavatar: free, zero secrets fallback (demoted to mid/low priority after Google Favicon V2)
    chain.push(companyUnavatarUrl(primaryDomain));

    if (includeFavicons) {
      // 7. DuckDuckGo icon service (primary favicon fallback, fetches genuine site favicon.ico)
      chain.push(companyDuckDuckGoFaviconUrl(primaryDomain));

      // 8. Google Favicon service (universal zero-auth fallback)
      chain.push(companyFaviconUrl(primaryDomain, sizePx));

      // If website domain is different from canonical domain, also try website domain as fallback
      const websiteDomain = extractDomainFromCompanyWebsite(companyData.website);
      if (websiteDomain && websiteDomain !== primaryDomain) {
        chain.push(companyDuckDuckGoFaviconUrl(websiteDomain));
        chain.push(companyFaviconUrl(websiteDomain, sizePx));
      }
    }
  }

  return Array.from(new Set(chain.filter(Boolean)));
};

export const renderCompanyAbbreviationGrid = (companyName: string, dialog?: boolean) => {
  if (companyName.length !== 4) return companyName;
  const letters = companyName.split("").map((letter) => letter.toUpperCase());
  return (
    <span className={`inline-grid grid-cols-2 grid-rows-2 font-display text-center font-bold ${dialog ? "gap-x-3 gap-y-2" : "gap-x-1"}`}>
      <span>{letters[0]}</span>
      <span>{letters[1]}</span>
      <span>{letters[2]}</span>
      <span>{letters[3]}</span>
    </span>
  );
};

// Memoized and cached version of analyzeImageBackground
const imageBackgroundCache = new Map<string, Promise<"light" | "dark" | null>>();

export const analyzeImageBackground = async (imageUrl: string): Promise<"light" | "dark" | null> => {
  if (imageBackgroundCache.has(imageUrl)) {
    const cachedPromise = imageBackgroundCache.get(imageUrl);
    if (cachedPromise) {
      return cachedPromise;
    }
  }
  const promise = (async () => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      return await new Promise<"light" | "dark" | null>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          let imageData: ImageData;
          try {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch {
            resolve(null);
            return;
          }
          const data = imageData.data;
          let totalPixels = 0;
          let transparentPixels = 0;
          let lightPixels = 0;
          let darkPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 0) {
              totalPixels++;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const brightness = (r + g + b) / 3;
              if (brightness > 128) lightPixels++;
              else darkPixels++;
            } else transparentPixels++;
          }
          const transparencyRatio = transparentPixels / (totalPixels + transparentPixels);
          const hasSignificantTransparency = transparencyRatio > 0.3;
          if (!hasSignificantTransparency || totalPixels === 0) {
            resolve(null);
            return;
          }
          const lightRatio = lightPixels / totalPixels;
          const darkRatio = darkPixels / totalPixels;
          if (lightRatio > darkRatio) resolve("light");
          else resolve("dark");
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.warn("Failed to analyze image background:", error);
      return null;
    }
  })();

  try {
    imageBackgroundCache.set(imageUrl, promise);
    return promise;
  } catch (error) {
    console.warn("Failed to cache image analysis promise:", error);
    return promise;
  }
};
