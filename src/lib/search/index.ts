import { InfiniteRange, Keywords, Location, Range, SearchExpression, Select } from "../../types/search";

// Export functions from other files
export { createAvailabilityRadioHandler, createNestedSelectHandler, createOncallCheckboxHandler, createShiftCheckboxHandler } from "./availability";
export { createCompanyHandler, createIndustryKeywordsHandler, createIndustryProfitHandler, createIndustryUsaJobsHandler, createSizeHandler, getSizeRanges } from "./company";
export { createBenefitsHandler, createEncouragedHandler } from "./compensation";
export { createExclusionHandler, getApplyFormDescription, getApplyFormMap, getApplyFormValueMap, normalizeActivityMetric, toActivityMetric } from "./general";
export {
  createLocationFlexibleRegionsHandler,
  createLocationIgnoreRadiusHandler,
  createLocationRadiusHandler,
  createLocationRadiusUnitHandler,
  createLocationsChangeHandler,
  createLocationWorkplaceTypeHandler,
  createWorkplaceActivityHandler,
  formatRadiusLabel,
  getCurrentRadius,
  getLocationLabels,
  getRadiusUnit,
  isFlexibleRegionSelected,
  isWorkplaceTypeSelected,
} from "./location";
export { createKeywordsHandler, createLicenseCertificationHandler, createLicenseCertificationHideRequiredHandler } from "./qualifications";
export { createEducationKeywordsHandler, createEducationPreferenceHandler, parseSearchExpression } from "./role-department";
export { applyFilterChipClear, formatQuotedSearchExpression, getFilterChips, groupFilterChips } from "./filter-chips";
export type { FilterChip, FilterChipGroup } from "./filter-chips";
export { isKeywordsItemSelected, isSelectItemSelected, isSelectWithNullItemSelected } from "./util";

// Export handler functions from handlers file
export {
  createBooleanHandler,
  createNestedBooleanHandler,
  createNestedKeywordsHandler,
  createRadioHandler,
  createRangeHandler,
  createSelectHandler,
  createSelectWithNullHandler,
} from "./handlers";

/**
 * Wording used by the formatted search summary whenever a value is empty.
 *
 * The search state itself keeps the literal "None" sentinel for empty selections
 * (see `filter-chips.ts` and `util.ts`), so the sentinel is only translated into
 * this wording at the formatting layer - never in the stored state.
 */
export const NO_SELECTION_DISPLAY = "No";

/** Translates the internal "None" sentinel into the summary's empty-value wording. */
function toDisplayText(value: string): string {
  return value === "None" ? NO_SELECTION_DISPLAY : value;
}

export function decodeSelectString(select: Select<string> | Select<string, null> | Select<string, string>, maxCount: number = 3) {
  if (!select) return NO_SELECTION_DISPLAY;
  if (Array.isArray(select)) return select.length === 0 ? NO_SELECTION_DISPLAY : select.slice(0, maxCount).join(", ");
  return toDisplayText(select);
}

export function formatValue(value: number, currency: string, money: boolean = true) {
  if (!money || currency === "None") return value.toString();

  const units = [
    { value: 1_000_000_000_000, symbol: "T" },
    { value: 1_000_000_000, symbol: "B" },
    { value: 1_000_000, symbol: "M" },
    { value: 1_000, symbol: "K" },
  ];

  let rounded = value;
  let unit = "";
  let displayValue: string | number = value;

  for (const u of units) {
    if (Math.abs(value) >= u.value) {
      rounded = Math.round(value / (u.value / 10)) / 10;
      displayValue = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2).replace(/\.?0+$/, "");
      unit = u.symbol;
      break;
    }
  }

  if (!unit) {
    return value.toString();
  }

  let symbol = currency;
  if (currency.length > 1) {
    try {
      const parts = (0).toLocaleString("en-US", { style: "currency", currency });
      symbol = parts.replace(/\d|[.,\s]/g, "");
    } catch {
      symbol = currency;
    }
  }

  return `${symbol}${displayValue}${unit}`;
}

export function decodeRangeString(range: Range | InfiniteRange, moneyFormat: boolean = true) {
  if (!range) return "All";
  if (range.min === 0 && range.max === 0) return "All";
  function formatNumber(num: number) {
    if (!moneyFormat) return num.toString();
    if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (Math.abs(num) >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "K";
    return num.toString();
  }

  if (range.min === range.max) return formatNumber(range.min);
  if (range.max === null) return formatNumber(range.min) + "+";
  return formatNumber(range.min) + " - " + formatNumber(range.max);
}

export function decodeSearchExpression(expression: SearchExpression<string>): string {
  if (!expression) return "";
  if (typeof expression === "string") return expression;
  if (expression.AND) return expression.AND.map(decodeSearchExpression).join(" AND ");
  if (expression.OR) return expression.OR.map(decodeSearchExpression).join(" OR ");
  if (expression.NOT) return "NOT (" + decodeSearchExpression(expression.NOT) + ")";
  return "";
}

export function decodeLocationInfo(location: Location): {
  addresses: string;
  radius: string;
  flexibleRegions: string;
  workplaceTypes: string;
} {
  if (!location) {
    return {
      addresses: NO_SELECTION_DISPLAY,
      radius: NO_SELECTION_DISPLAY,
      flexibleRegions: NO_SELECTION_DISPLAY,
      workplaceTypes: NO_SELECTION_DISPLAY,
    };
  }

  const address = location.address.formatted;
  const radius = location.options?.radius || 0;
  const radiusUnit = location.options?.radius_unit || "Miles";
  const ignoreRadius = location.options?.ignore_radius || false;
  const flexibleRegions = location.options?.flexible_regions || [];
  const workplaceTypes = location.workplace_type;

  // Format radius
  let radiusText = NO_SELECTION_DISPLAY;
  if (ignoreRadius) {
    radiusText = "Exact location";
  } else if (radius > 0) {
    radiusText = `${radius} ${radiusUnit.toLowerCase()}`;
  }

  // Format flexible regions
  let flexibleRegionsText = NO_SELECTION_DISPLAY;
  if (flexibleRegions.length > 0) {
    const regionNames = flexibleRegions.map((region) => {
      switch (region) {
        case "Admin Area":
          return "state";
        case "Country":
          return "country";
        case "Continent":
          return "continent";
        default:
          return region.toLowerCase();
      }
    });
    flexibleRegionsText = regionNames.join(", ");
  }

  // Format workplace types
  let workplaceTypesText = "All";
  if (workplaceTypes && workplaceTypes !== "All") {
    const types = Array.isArray(workplaceTypes) ? workplaceTypes : [workplaceTypes];
    if (types.length > 0) {
      workplaceTypesText = types.join(", ");
    }
  }

  return {
    addresses: address || NO_SELECTION_DISPLAY,
    radius: radiusText,
    flexibleRegions: flexibleRegionsText,
    workplaceTypes: workplaceTypesText,
  };
}

export function decodeLocations(locations: Location[]): {
  addresses: string;
  radius: string;
  flexibleRegions: string;
  workplaceTypes: string;
  isMultiple: boolean;
} {
  if (!locations || locations.length === 0) {
    return {
      addresses: NO_SELECTION_DISPLAY,
      radius: NO_SELECTION_DISPLAY,
      flexibleRegions: NO_SELECTION_DISPLAY,
      workplaceTypes: NO_SELECTION_DISPLAY,
      isMultiple: false,
    };
  }

  if (locations.length === 1) {
    return {
      ...decodeLocationInfo(locations[0]),
      isMultiple: false,
    };
  }

  // For multiple locations, just show the addresses
  const addresses =
    locations
      .map((location) => location.address.formatted)
      .filter(Boolean)
      .join("; ") || NO_SELECTION_DISPLAY;

  return {
    addresses,
    radius: "Multiple locations",
    flexibleRegions: "Multiple locations",
    workplaceTypes: "Multiple locations",
    isMultiple: true,
  };
}

export function decodeKeywords(keywords: Keywords, maxCount: number = 5) {
  if (!keywords) return { include: NO_SELECTION_DISPLAY, exclude: NO_SELECTION_DISPLAY };
  const include =
    keywords.include?.length === 0 ? NO_SELECTION_DISPLAY : decodeSelectString(keywords.include || [], maxCount) + ((keywords.include?.length || 0) > maxCount ? "..." : "");
  const exclude =
    keywords.exclude === "None"
      ? NO_SELECTION_DISPLAY
      : decodeSelectString(keywords.exclude || "None", maxCount) + ((Array.isArray(keywords.exclude) ? keywords.exclude.length : 0) > maxCount ? "..." : "");
  return { include, exclude };
}
