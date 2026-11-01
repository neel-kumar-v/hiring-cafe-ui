import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanDomain,
  companyBrandfetchUrl,
  companyClearbitUrl,
  companyDuckDuckGoFaviconUrl,
  companyFaviconUrl,
  companyGoogleFaviconV2Url,
  companyUnavatarUrl,
  extractDomainFromCompanyWebsite,
  getCompanyLogoSources,
  isExpandableLogo,
  isFaviconServiceUrl,
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

test("getCompanyLogoSources candidate order prioritizes high-res sources over unavatar and fallbacks", () => {
  const sources = getCompanyLogoSources({ canonical_domain: "hcltech.com" }, 128);
  const gstaticIdx = sources.findIndex((s) => s.includes("gstatic.com/faviconV2"));
  const unavatarIdx = sources.findIndex((s) => s.includes("unavatar.io"));
  const ddgIdx = sources.findIndex((s) => s.includes("icons.duckduckgo.com"));
  const googleFaviconIdx = sources.findIndex((s) => s.includes("googleusercontent.com/s2/favicons"));

  assert.ok(gstaticIdx !== -1, "gstatic_v2 must be present");
  assert.ok(unavatarIdx !== -1, "unavatar must be present");
  assert.ok(ddgIdx !== -1, "ddg must be present");
  assert.ok(googleFaviconIdx !== -1, "google favicon must be present");

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
  assert.equal(
    isExpandableLogo(128, 128, { src: "https://s2.googleusercontent.com/s2/favicons?domain=example.com" }),
    false
  );
  assert.equal(
    isExpandableLogo(128, 128, { src: "https://icons.duckduckgo.com/ip3/example.com.ico" }),
    false
  );

  // SVGs are vector and can scale from small viewBoxes
  assert.equal(isExpandableLogo(24, 24, { isSvg: true }), true);
  assert.equal(isExpandableLogo(24, 24, { src: "https://example.com/logo.svg" }), true);
  // But letterboxed SVGs are still rejected
  assert.equal(isExpandableLogo(100, 24, { isSvg: true }), false);
});
