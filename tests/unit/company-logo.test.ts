import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanDomain,
  companyBrandfetchUrl,
  companyClearbitUrl,
  companyDuckDuckGoFaviconUrl,
  companyFaviconUrl,
  companyGoogleFaviconV2Url,
  companyOpenBrandUrl,
  companyUnavatarUrl,
  extractDomainFromCompanyWebsite,
  getCompanyLogoSources,
  isExpandableLogo,
  isFaviconServiceUrl,
  isOpenBrandUrl,
} from "../../src/lib/company-info";

test("cleanDomain normalizes domains and strips www", () => {
  assert.equal(cleanDomain("www.stripe.com"), "stripe.com");
  assert.equal(cleanDomain("https://www.stripe.com"), "stripe.com");
  assert.equal(cleanDomain("  GOOGLE.COM  "), "google.com");
  assert.equal(cleanDomain("lockheedmartin.com"), "lockheedmartin.com");
  assert.equal(cleanDomain("https://www.lockheedmartin.com/en-us/index.html"), "lockheedmartin.com");
  assert.equal(cleanDomain("hcltech.com/"), "hcltech.com");
  assert.equal(cleanDomain("http://hcltech.com"), "hcltech.com");
  assert.equal(cleanDomain("lockheed-martin"), null);
  assert.equal(cleanDomain("localhost"), null);
  assert.equal(cleanDomain("127.0.0.1"), null);
  assert.equal(cleanDomain("null"), null);
  assert.equal(cleanDomain("undefined"), null);
  assert.equal(cleanDomain(undefined), null);
  assert.equal(cleanDomain(null), null);
  assert.equal(cleanDomain(""), null);
});

test("extractDomainFromCompanyWebsite extracts clean hostnames", () => {
  assert.equal(extractDomainFromCompanyWebsite("https://www.stripe.com/careers"), "stripe.com");
  assert.equal(extractDomainFromCompanyWebsite("http://airbnb.com/"), "airbnb.com");
  assert.equal(extractDomainFromCompanyWebsite("careers.google.com"), "careers.google.com");
  assert.equal(extractDomainFromCompanyWebsite("https://sub.domain.co.uk/jobs?id=123#top"), "sub.domain.co.uk");
  assert.equal(extractDomainFromCompanyWebsite(""), null);
  assert.equal(extractDomainFromCompanyWebsite(null), null);
  assert.equal(extractDomainFromCompanyWebsite("null"), null);
  assert.equal(extractDomainFromCompanyWebsite("undefined"), null);
  assert.equal(extractDomainFromCompanyWebsite("http://localhost:3000"), null);
});

test("url builder helpers construct expected endpoints", () => {
  assert.equal(companyUnavatarUrl("airbnb.com"), "https://unavatar.io/airbnb.com?fallback=false");
  assert.equal(companyUnavatarUrl("www.airbnb.com"), "https://unavatar.io/airbnb.com?fallback=false");
  assert.equal(companyFaviconUrl("stripe.com", 256), "https://s2.googleusercontent.com/s2/favicons?domain=stripe.com&sz=256");
  assert.equal(
    companyGoogleFaviconV2Url("stripe.com", 256),
    "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://stripe.com&size=256"
  );
  assert.equal(companyBrandfetchUrl("stripe.com", "test-client-id"), "https://cdn.brandfetch.io/stripe.com/logo?c=test-client-id");
  assert.equal(companyClearbitUrl("stripe.com"), "https://logo.clearbit.com/stripe.com");
  assert.equal(companyDuckDuckGoFaviconUrl("stripe.com"), "https://icons.duckduckgo.com/ip3/stripe.com.ico");
  assert.equal(companyOpenBrandUrl("stripe.com"), "/api/openbrand-logo?domain=stripe.com");
  assert.equal(companyOpenBrandUrl("www.stripe.com"), "/api/openbrand-logo?domain=stripe.com");
  assert.equal(companyOpenBrandUrl("https://www.stripe.com/careers"), "/api/openbrand-logo?domain=stripe.com");
});

test("getCompanyLogoSources prioritizes explicit image_url first", () => {
  const sources = getCompanyLogoSources(
    {
      image_url: "https://cdn.example.com/logo.png",
      canonical_domain: "example.com",
      website: "https://www.example.com",
    },
    256
  );

  assert.equal(sources[0], "https://cdn.example.com/logo.png");
  assert.ok(sources.includes("https://unavatar.io/example.com?fallback=false"));
  assert.ok(sources.includes("https://s2.googleusercontent.com/s2/favicons?domain=example.com&sz=256"));
});

test("getCompanyLogoSources prefers canonical_domain over website when extracting domain", () => {
  const sources = getCompanyLogoSources(
    {
      canonical_domain: "stripe.com",
      website: "https://boards.greenhouse.io/stripe",
    },
    256
  );

  // Unavatar should look up canonical_domain (stripe.com), not greenhouse.io
  assert.ok(sources.includes("https://unavatar.io/stripe.com?fallback=false"));
  assert.ok(sources.includes("https://s2.googleusercontent.com/s2/favicons?domain=stripe.com&sz=256"));
});

test("getCompanyLogoSources falls back to website if canonical_domain is missing", () => {
  const sources = getCompanyLogoSources(
    {
      website: "https://www.netflix.com/jobs",
    },
    256
  );

  assert.ok(sources.includes("https://unavatar.io/netflix.com?fallback=false"));
  assert.ok(sources.includes("https://s2.googleusercontent.com/s2/favicons?domain=netflix.com&sz=256"));
  assert.ok(sources.includes("https://icons.duckduckgo.com/ip3/netflix.com.ico"));
});

test("getCompanyLogoSources includes keyed providers when env vars are set", () => {
  const oldBrandfetch = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;
  const oldLogoDev = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const oldClearbit = process.env.NEXT_PUBLIC_CLEARBIT_LOGO_URL;

  try {
    process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = "bf-client-123";
    process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN = "logodev-key-456";
    process.env.NEXT_PUBLIC_CLEARBIT_LOGO_URL = "https://custom-clearbit-proxy.com";

    const sources = getCompanyLogoSources(
      {
        canonical_domain: "uber.com",
      },
      256
    );

    assert.ok(sources.includes("https://cdn.brandfetch.io/uber.com/logo?c=bf-client-123"));
    assert.ok(sources.includes("https://cdn.brandfetch.io/uber.com/icon?c=bf-client-123"));
    assert.ok(sources.includes("https://custom-clearbit-proxy.com/uber.com"));
    assert.ok(sources.includes("https://img.logo.dev/uber.com?token=logodev-key-456&size=256"));
  } finally {
    process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID = oldBrandfetch;
    process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN = oldLogoDev;
    process.env.NEXT_PUBLIC_CLEARBIT_LOGO_URL = oldClearbit;
  }
});

test("getCompanyLogoSources returns empty chain when no domain or image exists", () => {
  const sources = getCompanyLogoSources(
    {
      image_url: null,
      canonical_domain: null,
      website: null,
    },
    256
  );

  assert.deepEqual(sources, []);
});

test("getCompanyLogoSources filters invalid or junk urls", () => {
  const sources = getCompanyLogoSources(
    {
      image_url: "null",
      website: "#",
      canonical_domain: "",
    },
    256
  );

  assert.deepEqual(sources, []);
});

test("getCompanyLogoSources with includeFavicons: false excludes low-res favicon services", () => {
  const sources = getCompanyLogoSources(
    {
      canonical_domain: "stripe.com",
      website: "https://stripe.com",
    },
    256,
    { includeFavicons: false }
  );

  // Reliable non-unavatar candidate is included
  assert.ok(sources.some((s) => s.includes("gstatic.com/faviconV2")));
  assert.ok(sources.includes("https://unavatar.io/stripe.com?fallback=false"));
  assert.ok(!sources.some((s) => s.includes("googleusercontent.com/s2/favicons")));
  assert.ok(!sources.some((s) => s.includes("icons.duckduckgo.com")));
});

test("getCompanyLogoSources places OpenBrand immediately after explicit image_url and before external favicon services", () => {
  const imageUrl = "https://cdn.example.com/logo.png";
  const sources = getCompanyLogoSources(
    {
      image_url: imageUrl,
      canonical_domain: "stripe.com",
      website: "https://www.stripe.com",
    },
    256
  );

  assert.equal(sources[0], imageUrl, "explicit image_url must remain first");
  assert.equal(sources[1], companyOpenBrandUrl("stripe.com"), "OpenBrand must be candidate #2");

  const openbrandIdx = sources.findIndex((s) => s.startsWith("/api/openbrand-logo"));
  const brandfetchIdx = sources.findIndex((s) => s.includes("cdn.brandfetch.io"));
  const clearbitIdx = sources.findIndex((s) => s.includes("logo.clearbit.com"));
  const gstaticIdx = sources.findIndex((s) => s.includes("gstatic.com/faviconV2"));
  const ddgIdx = sources.findIndex((s) => s.includes("icons.duckduckgo.com"));

  assert.ok(openbrandIdx !== -1, "OpenBrand must be present");
  assert.ok(openbrandIdx < gstaticIdx, "OpenBrand must precede Google Favicon V2");
  assert.ok(openbrandIdx < ddgIdx, "OpenBrand must precede DuckDuckGo favicon");
  if (brandfetchIdx !== -1) assert.ok(openbrandIdx < brandfetchIdx, "OpenBrand must precede Brandfetch");
  if (clearbitIdx !== -1) assert.ok(openbrandIdx < clearbitIdx, "OpenBrand must precede Clearbit");
});

test("getCompanyLogoSources places OpenBrand first when image_url is absent", () => {
  const sources = getCompanyLogoSources(
    {
      canonical_domain: "stripe.com",
      website: "https://www.stripe.com",
    },
    256
  );

  const openbrandIdx = sources.findIndex((s) => s.startsWith("/api/openbrand-logo"));
  const gstaticIdx = sources.findIndex((s) => s.includes("gstatic.com/faviconV2"));
  const ddgIdx = sources.findIndex((s) => s.includes("icons.duckduckgo.com"));

  assert.equal(sources[0], companyOpenBrandUrl("stripe.com"), "OpenBrand must be the first candidate when image_url is missing");
  assert.ok(openbrandIdx < gstaticIdx, "OpenBrand must precede Google Favicon V2");
  assert.ok(openbrandIdx < ddgIdx, "OpenBrand must precede DuckDuckGo favicon");
});

test("getCompanyLogoSources candidate order prioritizes high-res sources over unavatar and fallbacks", () => {
  const sources = getCompanyLogoSources({ canonical_domain: "hcltech.com" }, 128);
  const openbrandIdx = sources.findIndex((s) => s.startsWith("/api/openbrand-logo"));
  const gstaticIdx = sources.findIndex((s) => s.includes("gstatic.com/faviconV2"));
  const unavatarIdx = sources.findIndex((s) => s.includes("unavatar.io"));
  const ddgIdx = sources.findIndex((s) => s.includes("icons.duckduckgo.com"));
  const googleFaviconIdx = sources.findIndex((s) => s.includes("googleusercontent.com/s2/favicons"));

  assert.ok(openbrandIdx !== -1, "OpenBrand must be present");
  assert.ok(gstaticIdx !== -1, "gstatic_v2 must be present");
  assert.ok(unavatarIdx !== -1, "unavatar must be present");
  assert.ok(ddgIdx !== -1, "ddg must be present");
  assert.ok(googleFaviconIdx !== -1, "google favicon must be present");

  // OpenBrand should be tried before lower-quality fallback chains
  assert.ok(openbrandIdx < gstaticIdx, "OpenBrand must precede Google Favicon V2");
  // Higher-quality free Google Favicon V2 must precede unavatar
  assert.ok(gstaticIdx < unavatarIdx, "Google Favicon V2 must precede unavatar");
  // Unavatar precedes low-res favicon fallbacks
  assert.ok(unavatarIdx < ddgIdx, "unavatar must precede DuckDuckGo favicon fallback");
  // DuckDuckGo genuine site favicon precedes standard Google favicon
  assert.ok(ddgIdx < googleFaviconIdx, "DuckDuckGo favicon fallback must precede standard Google favicon");
});

test("isFaviconServiceUrl identifies favicon endpoints and icon files", () => {
  assert.equal(isFaviconServiceUrl("https://icons.duckduckgo.com/ip3/stripe.com.ico"), true);
  assert.equal(isFaviconServiceUrl("https://s2.googleusercontent.com/s2/favicons?domain=stripe.com&sz=256"), true);
  assert.equal(isFaviconServiceUrl("https://example.com/favicon.ico"), true);
  assert.equal(isFaviconServiceUrl("https://example.com/assets/favicon.png"), true);
  assert.equal(isFaviconServiceUrl("https://cdn.brandfetch.io/stripe.com/icon?c=123"), false);
  assert.equal(isFaviconServiceUrl("https://unavatar.io/stripe.com?fallback=false"), false);
  assert.equal(isFaviconServiceUrl("https://example.com/logo.png"), false);
  assert.equal(isFaviconServiceUrl(null), false);
  assert.equal(isFaviconServiceUrl(""), false);
});

test("isExpandableLogo validates square and properly filling logos", () => {
  // Perfect square and near-square ratios expand cleanly
  assert.equal(isExpandableLogo(128, 128), true);
  assert.equal(isExpandableLogo(256, 256), true);
  assert.equal(isExpandableLogo(120, 100), true); // 1.2
  assert.equal(isExpandableLogo(100, 120), true); // 0.83
  assert.equal(isExpandableLogo(130, 100), true); // 1.3
  assert.equal(isExpandableLogo(75, 100), true); // 0.75

  // Letterboxed wide banners cannot fill square slot
  assert.equal(isExpandableLogo(300, 100), false); // 3.0 ratio
  assert.equal(isExpandableLogo(400, 100), false); // 4.0 ratio
  assert.equal(isExpandableLogo(200, 100), false); // 2.0 ratio
  assert.equal(isExpandableLogo(150, 100), false); // 1.5 ratio

  // Pillarboxed tall images cannot fill square slot
  assert.equal(isExpandableLogo(50, 150), false); // 0.33 ratio
  assert.equal(isExpandableLogo(60, 100), false); // 0.6 ratio

  // Tiny favicons below minDimension (default 64)
  assert.equal(isExpandableLogo(16, 16), false);
  assert.equal(isExpandableLogo(32, 32), false);
  assert.equal(isExpandableLogo(48, 48), false);
  assert.equal(isExpandableLogo(48, 48, { minDimension: 40 }), true); // custom smaller slot

  // Failed decodes or empty images
  assert.equal(isExpandableLogo(0, 0), false);
  assert.equal(isExpandableLogo(0, 100), false);
  assert.equal(isExpandableLogo(-10, -10), false);
  assert.equal(isExpandableLogo(NaN, 100), false);

  // Favicon URLs rejected even if reported with larger dimensions
  assert.equal(isExpandableLogo(128, 128, { src: "https://s2.googleusercontent.com/s2/favicons?domain=example.com" }), false);
  assert.equal(isExpandableLogo(128, 128, { src: "https://icons.duckduckgo.com/ip3/example.com.ico" }), false);

  // SVGs are vector and can scale from small viewBoxes
  assert.equal(isExpandableLogo(24, 24, { isSvg: true }), true);
  assert.equal(isExpandableLogo(24, 24, { src: "https://example.com/logo.svg" }), true);
  // But letterboxed SVGs are still rejected
  assert.equal(isExpandableLogo(100, 24, { isSvg: true }), false);
});

test("isOpenBrandUrl identifies internal openbrand-logo API endpoints", () => {
  assert.equal(isOpenBrandUrl("/api/openbrand-logo?domain=stripe.com"), true);
  assert.equal(isOpenBrandUrl("https://example.com/api/openbrand-logo?domain=openai.com"), true);
  assert.equal(isOpenBrandUrl("https://images.stripeassets.com/favicon.svg"), false);
  assert.equal(isOpenBrandUrl("https://s2.googleusercontent.com/s2/favicons?domain=stripe.com"), false);
  assert.equal(isOpenBrandUrl(null), false);
  assert.equal(isOpenBrandUrl(""), false);
});

test("isExpandableLogo with allowWordmarks accepts genuine brand wordmarks while rejecting low-res icons", () => {
  // Wide SVGs like Booz Allen Hamilton (192.6x30, aspect 6.42) or Trust Wallet (102.8x27.8, aspect 3.7)
  assert.equal(isExpandableLogo(193, 30, { isSvg: true, allowWordmarks: true }), true);
  assert.equal(isExpandableLogo(103, 28, { isSvg: true, allowWordmarks: true }), true);
  assert.equal(isExpandableLogo(300, 100, { isSvg: true, allowWordmarks: true }), true); // 3.0 ratio
  assert.equal(isExpandableLogo(400, 100, { isSvg: true, allowWordmarks: true }), true); // 4.0 ratio

  // Wide raster images with sufficient width and height (e.g. 300x60 PNG, 200x50 PNG)
  assert.equal(isExpandableLogo(300, 60, { allowWordmarks: true, minDimension: 64 }), true);
  assert.equal(isExpandableLogo(240, 48, { allowWordmarks: true, minDimension: 44 }), true);

  // Rejects extreme aspect ratios (ratio > 6.5 or ratio < 0.4)
  assert.equal(isExpandableLogo(800, 50, { isSvg: true, allowWordmarks: true }), false); // 16.0 ratio
  assert.equal(isExpandableLogo(30, 100, { isSvg: true, allowWordmarks: true }), false); // 0.3 ratio

  // Rejects tiny raster icons (<44px or <16px height)
  assert.equal(isExpandableLogo(32, 32, { allowWordmarks: true, minDimension: 64 }), false);
  assert.equal(isExpandableLogo(16, 16, { allowWordmarks: true, minDimension: 64 }), false);
  assert.equal(isExpandableLogo(200, 12, { allowWordmarks: true, minDimension: 64 }), false); // height < 16
});

test("isExpandableLogo with allowFavicons permits high-res favicons extracted by OpenBrand", () => {
  // Stripe 512x512 favicon.svg
  assert.equal(
    isExpandableLogo(512, 512, {
      src: "https://images.stripeassets.com/favicon.svg",
      isSvg: true,
      allowFavicons: true,
    }),
    true
  );

  // EA 256x256 favicon.ico
  assert.equal(
    isExpandableLogo(256, 256, {
      src: "https://ea.com/static/media/favicon.ico",
      allowFavicons: true,
    }),
    true
  );

  // Disallowed favicon URLs without allowFavicons flag are rejected
  assert.equal(
    isExpandableLogo(512, 512, {
      src: "https://images.stripeassets.com/favicon.svg",
      isSvg: true,
      allowFavicons: false,
    }),
    false
  );
});
