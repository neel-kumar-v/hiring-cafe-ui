import { InfiniteRange, Keywords, Location, Range, SearchExpression, Select } from '../../types/search';

// Export functions from other files
export { createAvailabilityRadioHandler, createNestedSelectHandler, createOncallCheckboxHandler, createShiftCheckboxHandler } from './availability';
export {
  createCompanyHandler, createFoundingYearHandler, createIndustryKeywordsHandler,
  createIndustryProfitHandler,
  createIndustryUsaJobsHandler, createSizeHandler, getSizeRanges
} from './company';
export { createBenefitsHandler, createDepartmentHandler, createEncouragedHandler } from './compensation';
export { createExclusionHandler, getApplyFormDescription, getApplyFormMap, getApplyFormValueMap } from './general';
export { convertSearchStateToHiringCafe } from './hiring-cafe';
export {
  createLocationFlexibleRegionsHandler,
  createLocationIgnoreRadiusHandler,
  createLocationRadiusHandler,
  createLocationRadiusUnitHandler,
  createLocationsChangeHandler,
  createLocationWorkplaceTypeHandler, createWorkplaceActivityHandler,
  formatRadiusLabel,
  getCurrentRadius,
  getLocationLabels,
  getRadiusUnit,
  isFlexibleRegionSelected,
  isWorkplaceTypeSelected
} from './location';
export {
  createKeywordsHandler,
  createLicenseCertificationHandler,
  createLicenseCertificationHideRequiredHandler
} from './qualifications';
export { createEducationKeywordsHandler, createEducationPreferenceHandler, parseSearchExpression } from './role-department';
export { isKeywordsItemSelected, isSelectItemSelected, isSelectWithNullItemSelected } from './util';

// Export handler functions from handlers file
export {
  createBooleanHandler, createNestedBooleanHandler, createNestedKeywordsHandler, createRadioHandler, createRangeHandler, createSelectHandler,
  createSelectWithNullHandler
} from './handlers';



export function decodeSelectString(select: Select<string> | Select<string, null> | Select<string, string>, maxCount: number = 3) {
  if (!select) return "None";
  if (Array.isArray(select)) return select.length === 0 ? "None" : select.slice(0, maxCount).join(", ");
  return select;
}

export function formatValue(value: number, currency: string, money: boolean = true) {
  if (!money || currency === 'None') return value.toString();

  const units = [
    { value: 1_000_000_000_000, symbol: 'T' },
    { value: 1_000_000_000, symbol: 'B' },
    { value: 1_000_000, symbol: 'M' },
    { value: 1_000, symbol: 'K' }
  ];

  let rounded = value;
  let unit = '';
  let displayValue: string | number = value;

  for (const u of units) {
    if (Math.abs(value) >= u.value) {
      rounded = Math.round(value / (u.value / 10)) / 10;
      displayValue = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2).replace(/\.?0+$/, '');
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
      const parts = (0).toLocaleString('en-US', { style: 'currency', currency });
      symbol = parts.replace(/\d|[.,\s]/g, '');
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
      addresses: "None",
      radius: "None",
      flexibleRegions: "None",
      workplaceTypes: "None"
    };
  }
  
  const address = location.address.formatted;
  const radius = location.options?.radius || 0;
  const radiusUnit = location.options?.radius_unit || "Miles";
  const ignoreRadius = location.options?.ignore_radius || false;
  const flexibleRegions = location.options?.flexible_regions || [];
  const workplaceTypes = location.workplace_type;
  
  // Format radius
  let radiusText = "None";
  if (ignoreRadius) {
    radiusText = "Exact location";
  } else if (radius > 0) {
    radiusText = `${radius} ${radiusUnit.toLowerCase()}`;
  }
  
  // Format flexible regions
  let flexibleRegionsText = "None";
  if (flexibleRegions.length > 0) {
    const regionNames = flexibleRegions.map(region => {
      switch (region) {
        case "Admin Area": return "state";
        case "Country": return "country";
        case "Continent": return "continent";
        default: return region.toLowerCase();
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
    addresses: address,
    radius: radiusText,
    flexibleRegions: flexibleRegionsText,
    workplaceTypes: workplaceTypesText
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
      addresses: "None",
      radius: "None",
      flexibleRegions: "None",
      workplaceTypes: "None",
      isMultiple: false
    };
  }
  
  if (locations.length === 1) {
    return {
      ...decodeLocationInfo(locations[0]),
      isMultiple: false
    };
  }
  
  // For multiple locations, just show the addresses
  const addresses = locations.map(location => location.address.formatted).join("; ");
  
  return {
    addresses,
    radius: "Multiple locations",
    flexibleRegions: "Multiple locations",
    workplaceTypes: "Multiple locations",
    isMultiple: true
  };
}

export function decodeKeywords(keywords: Keywords, maxCount: number = 5) {
  if (!keywords) return { include: "None", exclude: "None" };
  const include = keywords.include?.length === 0 ? "None" : decodeSelectString(keywords.include || [], maxCount) + ((keywords.include?.length || 0) > maxCount ? "..." : "");
  const exclude = keywords.exclude === "None" ? "None" : decodeSelectString(keywords.exclude || "None", maxCount) + ((Array.isArray(keywords.exclude) ? keywords.exclude.length : 0) > maxCount ? "..." : "");
  return { include, exclude };
}





