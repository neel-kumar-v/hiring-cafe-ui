import { CompensationRange } from "@/types/job";

const removeCompanyName = (title: string, company: string): string => {
  if (!company) return title;
  if (!title.toLowerCase().includes(company.toLowerCase())) return title;
  const regex = new RegExp(
    company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:[,-:|]|- | -)*\\s*",
    "i"
  );
  return title.replace(regex, "");
};

const removeParentheses = (title: string): string => {
  return title.replace(/\s*\([^)]*\)/g, "").trim();
};

const removeLocationAndPrepositions = (
  title: string,
  location: string
): string => {
  let cleanedTitle = title;
  if (!location) return cleanedTitle;
  const locationParts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  locationParts.forEach((part, idx) => {
    if (!part) return;
    const patterns = [part];
    if (idx === 1) {
      const abbr = formatState(part);
      if (abbr !== part) patterns.push(abbr);
      const full = Object.keys(stateAbbreviations).find(
        (key) => stateAbbreviations[key] === part
      );
      if (full) patterns.push(full);
    }
    if (idx === 2) {
      const abbr = countryAbbreviations[part] || part;
      if (abbr !== part) patterns.push(abbr);
      const full = Object.keys(countryAbbreviations).find(
        (key) => countryAbbreviations[key] === part
      );
      if (full) patterns.push(full);
    }
    patterns.forEach((pat) => {
      cleanedTitle = cleanedTitle.replace(
        new RegExp(`\\b${pat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"),
        ""
      );
    });
  });
  cleanedTitle = cleanedTitle.replace(/\s+at+.*$/i, "").trim();
  cleanedTitle = cleanedTitle.replace(/\s+in+.*$/i, "").trim();
  cleanedTitle = cleanedTitle
    .replace(/[\s\-|,:]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleanedTitle;
};

const GENERIC_TITLES = [
  "remote",
  "full time",
  "full-time",
  "fulltime",
  "part time",
  "part-time",
  "parttime",
  "on site",
  "on-site",
  "onsite",
  "hybrid",
  "consultant",
  "consulting",
  "volunteer",
  "volunteering",
  "entry level",
  "entry-level",
  "contract",
  "contractor",
  "contracting",
  "contracted",
  "contracted",
];

const removeGenericTitles = (title: string): string => {
  const trimmed = title.trim().toLowerCase();
  if (GENERIC_TITLES.includes(trimmed)) {
    return "";
  }
  const genericPattern = new RegExp(
    `(?:^|[-|,:\\s])\\s*(${GENERIC_TITLES.join("|")})\\s*(?:$|[-|,:\\s])`,
    "gi"
  );
  return title
    .replace(genericPattern, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const removeShiftTimings = (title: string): string => {
  return title
    .replace(
      /\b\d{1,2}:\d{2}\s?(?:am|pm)?\s*-\s*\d{1,2}:\d{2}\s?(?:am|pm)?\b/gi,
      ""
    )
    .trim();
};

const removeTrailingPunctuation = (title: string): string => {
  return title.replace(/[\s\-|,:]+$/, "").trim();
};

const removeTools = (title: string, tools: string[]): string => {
  let cleanedTitle = title;
  tools.forEach((tool) => {
    const regex = new RegExp(
      `\\b${tool.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[\s,;:/-]*`,
      "gi"
    );
    cleanedTitle = cleanedTitle.replace(regex, "");
  });
  cleanedTitle = cleanedTitle.replace(/\b(or|and)\b[,\s;:/-]*/gi, "");
  return cleanedTitle.replace(/\s{2,}/g, " ").trim();
};

export const getCleanJobTitle = (
  jobTitle: string,
  companyName: string,
  location: string,
  tools?: string[]
): string => {
  const rawTitle = jobTitle || "";
  const company = companyName || "";
  let title = rawTitle;

  title = removeCompanyName(title, company);
  title = removeParentheses(title);
  title = removeLocationAndPrepositions(title, location);
  title = removeGenericTitles(title);
  title = removeShiftTimings(title);
  if (tools && tools.length > 0) title = removeTools(title, tools);
  title = removeTrailingPunctuation(title);

  return title;
};

export const getCompensation = (compensation: CompensationRange) => {
  const format = (min: number | null, max: number | null, unit: string) => {
    const minNum = typeof min === "string" ? Number.parseFloat(min) : min;
    const maxNum = typeof max === "string" ? Number.parseFloat(max) : max;

    const formatValue = (val: number | null, isHourly = false) => {
      if (val == null) return null;
      if (isHourly) {
        return Math.round(val).toLocaleString();
      }
      if (val >= 1000) {
        const rounded = Math.round(val / 1000);
        return `${rounded}k`;
      }
      return Math.round(val).toLocaleString();
    };

    const displayUnit = `/${unit}`;
    const isHourly = unit === "hr";

    if (minNum != null && maxNum != null) {
      if (minNum === maxNum)
        return `${formatValue(minNum, isHourly)}${displayUnit}`;
      if (minNum >= 1000 && maxNum >= 1000) {
        const minRounded = Math.round(minNum / 1000);
        const maxRounded = Math.round(maxNum / 1000);
        return `${minRounded}K-${maxRounded}K${displayUnit}`;
      }
      return `${formatValue(minNum, isHourly)}-${formatValue(
        maxNum,
        isHourly
      )}${displayUnit}`;
    }
    if (minNum != null) return `${formatValue(minNum, isHourly)}${displayUnit}`;
    if (maxNum != null) return `${formatValue(maxNum, isHourly)}${displayUnit}`;
    return null;
  };

  const yearly = format(
    compensation.yearly_min_compensation,
    compensation.yearly_max_compensation,
    "yr"
  );
  if (yearly) return yearly;

  const monthly = format(
    compensation.monthly_min_compensation,
    compensation.monthly_max_compensation,
    "mo"
  );
  if (monthly) return monthly;

  const biweekly = format(
    compensation["bi-weekly_min_compensation"],
    compensation["bi-weekly_max_compensation"],
    "bi-wk"
  );
  if (biweekly) return biweekly;

  const weekly = format(
    compensation.weekly_min_compensation,
    compensation.weekly_max_compensation,
    "wk"
  );
  if (weekly) return weekly;

  const daily = format(
    compensation.daily_min_compensation,
    compensation.daily_max_compensation,
    "day"
  );
  if (daily) return daily;

  const hourly = format(
    compensation.hourly_min_compensation,
    compensation.hourly_max_compensation,
    "hr"
  );
  if (hourly) return hourly;

  return null;
};

const stateAbbreviations: { [key: string]: string } = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

export const formatState = (state: string) => {
  const cleanState = state.trim();
  const found = Object.entries(stateAbbreviations).find(
    ([full, abbr]) =>
      full.toLowerCase() === cleanState.toLowerCase() ||
      abbr.toLowerCase() === cleanState.toLowerCase()
  );
  if (found) {
    return found[1];
  }
  return state;
};

const countryAbbreviations: { [key: string]: string } = {
  "United States": "US",
  "United Kingdom": "UK",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  India: "IN",
};

export const getLocation = (location: string) => {
  const splitLocation = location.split(",");
  if (splitLocation.length > 2) {
    return splitLocation[0] + ", " + formatState(splitLocation[1]);
  }
  return location;
};

export const getLocations = (workplaceCities: string[]) => {
  return workplaceCities
    .filter((city) => city && city.length > 0)
    .map((city) => getLocation(city));
};

export function getTimeSince(dateString: string): string {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  if (isNaN(diffMs)) return "";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);
  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}mo`;
  if (weeks > 0) return `${weeks}w`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export const formatJobDescription = (description: string): string => {
  if (!description) return "";

  // Decode URL-encoded characters safely
  let formatted = description;
  try {
    formatted = decodeURIComponent(description);
  } catch {
    // If decodeURIComponent fails, try to handle common malformed sequences
    formatted = description
      .replace(/%[0-9A-Fa-f]{2}/g, (match) => {
        try {
          return decodeURIComponent(match);
        } catch {
          return match; // Keep original if it can't be decoded
        }
      })
      .replace(/%[^0-9A-Fa-f]/g, ""); // Remove invalid percent sequences
  }

  // Replace common HTML entities
  const htmlEntities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&sbquo;": "‚",
    "&bdquo;": "„",
    "&hellip;": "...",
    "&mdash;": "—",
    "&ndash;": "–",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&deg;": "°",
    "&plusmn;": "±",
    "&times;": "×",
    "&divide;": "÷",
    "&frac12;": "½",
    "&frac14;": "¼",
    "&frac34;": "¾",
    "&sup1;": "¹",
    "&sup2;": "²",
    "&sup3;": "³",
    "&micro;": "µ",
    "&para;": "¶",
    "&sect;": "§",
    "&bull;": "•",
    "&middot;": "·",
    "&dagger;": "†",
    "&Dagger;": "‡",
    "&permil;": "‰",
    "&lsaquo;": "‹",
    "&rsaquo;": "›",
    "&euro;": "€",
    "&larr;": "←",
    "&rarr;": "→",
    "&uarr;": "↑",
    "&darr;": "↓",
    "&harr;": "↔",
    "&crarr;": "↵",
    "&lArr;": "⇐",
    "&rArr;": "⇒",
    "&uArr;": "⇑",
    "&dArr;": "⇓",
    "&hArr;": "⇔",
    "&forall;": "∀",
    "&part;": "∂",
    "&exist;": "∃",
    "&empty;": "∅",
    "&nabla;": "∇",
    "&isin;": "∈",
    "&notin;": "∉",
    "&ni;": "∋",
    "&prod;": "∏",
    "&sum;": "∑",
    "&minus;": "−",
    "&lowast;": "∗",
    "&radic;": "√",
    "&prop;": "∝",
    "&infin;": "∞",
    "&ang;": "∠",
    "&and;": "∧",
    "&or;": "∨",
    "&cap;": "∩",
    "&cup;": "∪",
    "&int;": "∫",
    "&there4;": "∴",
    "&sim;": "∼",
    "&cong;": "≅",
    "&asymp;": "≈",
    "&ne;": "≠",
    "&equiv;": "≡",
    "&le;": "≤",
    "&ge;": "≥",
    "&sub;": "⊂",
    "&sup;": "⊃",
    "&nsub;": "⊄",
    "&sube;": "⊆",
    "&supe;": "⊇",
    "&oplus;": "⊕",
    "&otimes;": "⊗",
    "&perp;": "⊥",
    "&sdot;": "⋅",
    "&lceil;": "⌈",
    "&rceil;": "⌉",
    "&lfloor;": "⌊",
    "&rfloor;": "⌋",
    "&lang;": "⟨",
    "&rang;": "⟩",
    "&loz;": "◊",
    "&spades;": "♠",
    "&clubs;": "♣",
    "&hearts;": "♥",
    "&diams;": "♦",
    "&OElig;": "Œ",
    "&oelig;": "œ",
    "&Scaron;": "Š",
    "&scaron;": "š",
    "&Yuml;": "Ÿ",
    "&circ;": "ˆ",
    "&tilde;": "˜",
    "&ensp;": " ",
    "&emsp;": " ",
    "&thinsp;": " ",
    "&zwnj;": "",
    "&zwj;": "",
    "&lrm;": "",
    "&rlm;": "",
  };

  // Replace HTML entities
  Object.entries(htmlEntities).forEach(([entity, replacement]) => {
    formatted = formatted.replace(new RegExp(entity, "g"), replacement);
  });

  // Clean up extra whitespace and line breaks
  formatted = formatted
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n") // Replace multiple line breaks with single
    .trim();

  // Consolidated style removal: remove color, font-size, font-family, line-height properties and related HTML attributes
  formatted = formatted.replace(
    /style\s*=\s*(['"])(.*?)\1/gi,
    (match, quote, styleContent) => {
      // Remove specified CSS properties from the style attribute
      const cleaned = styleContent
        .split(";")
        .map((rule: string) => rule.trim())
        .filter((rule: string) => {
          // Remove if rule starts with any of the specified properties
          return !/^(color|background|background-color|background-image|background-gradient|border-color|border-top-color|border-right-color|border-bottom-color|border-left-color|fill|stroke|font-size|font-family|line-height)\s*:/i.test(
            rule
          );
        })
        .join("; ");
      // If nothing left, remove the style attribute entirely
      if (!cleaned.trim()) return "";
      return `style=${quote}${cleaned}${quote}`;
    }
  );

  // Remove color-related HTML attributes (e.g., color="red", bgcolor="blue")
  formatted = formatted.replace(
    /\s*(color|bgcolor|bordercolor|fill|stroke)\s*=\s*(['"])[^'"]*\2/gi,
    ""
  );

  return formatted;
};

export const formatTool = (tool: string) => {
  if (!tool) return tool;
  return tool
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const getExperienceInfo = (
  minIndustryAndRoleYoe: number | null | undefined,
  minManagementAndLeadershipYoe: number | null | undefined
) => {
  const hasIndustry =
    minIndustryAndRoleYoe !== null && minIndustryAndRoleYoe !== undefined;
  const hasLeadership =
    minManagementAndLeadershipYoe !== null &&
    minManagementAndLeadershipYoe !== undefined;

  const industryBadge = hasIndustry ? `${minIndustryAndRoleYoe}+ YOE` : null;
  const leadershipBadge = hasLeadership
    ? `${minManagementAndLeadershipYoe}+ YOM`
    : null;

  const industryTooltip = hasIndustry
    ? `This job requires ${minIndustryAndRoleYoe}+ years of experience`
    : null;
  const leadershipTooltip = hasLeadership
    ? `This job requires ${minManagementAndLeadershipYoe}+ years of leadership/management experience`
    : null;

  return {
    industryBadge,
    leadershipBadge,
    industryTooltip,
    leadershipTooltip,
    hasAny: hasIndustry || hasLeadership,
  };
};