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
  const raw = domain.trim().toLowerCase();
  if (!raw || raw === "localhost" || raw === "127.0.0.1" || raw === "null" || raw === "undefined") return null;
  return raw.replace(/^www\./, "");
};

export const extractDomainFromCompanyWebsite = (website: string | null | undefined): string | null => {
  const raw = website?.trim();
  if (!raw || raw === "null" || raw === "undefined") return null;
  try {
    const normalized = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    let host = new URL(normalized).hostname.toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") return null;
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }
    return host;
  } catch {
    return null;
  }
};

export const companyFaviconUrl = (domain: string, sizePx: number): string =>
  `https://s2.googleusercontent.com/s2/favicons?domain=${encodeURIComponent(cleanDomain(domain) || domain)}&sz=${sizePx}`;

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

  if (options?.src && isFaviconServiceUrl(options.src)) {
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
 * 5. Unavatar (free zero-secret high-fidelity SVG/Apple-Touch-Icon resolver)
 * 6. Google Favicon service (universal fallback favicon at requested pixel dimensions)
 * 7. DuckDuckGo Favicon service (secondary favicon fallback)
 * 8. Secondary website domain if distinct from canonical domain
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

    // 5. Unavatar: free, zero secrets, extracts SVGs and 180px+ Apple Touch Icons directly from the domain
    chain.push(companyUnavatarUrl(primaryDomain));

    if (includeFavicons) {
      // 6. Google Favicon service (universal zero-auth fallback)
      chain.push(companyFaviconUrl(primaryDomain, sizePx));

      // 7. DuckDuckGo icon service (secondary favicon fallback)
      chain.push(companyDuckDuckGoFaviconUrl(primaryDomain));

      // If website domain is different from canonical domain, also try website domain as fallback
      const websiteDomain = extractDomainFromCompanyWebsite(companyData.website);
      if (websiteDomain && websiteDomain !== primaryDomain) {
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
