import React from "react";
import { MapPin, DollarSign, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompensationRange } from "@/types/jobs";

const LocationBadge = ({ location }: { location: string }) => (
  <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-md w-fit pl-1 px-2 py-0.5">
    <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500" />
    {location}
  </span>
);

const JobHeader = ({
  jobTitle,
  companyName,
  location,
  publishDate,
  compensation,
}: {
  jobTitle: string;
  companyName: string;
  location: string;
  publishDate: string;
  compensation: CompensationRange;
}) => {
  // ... (all helper functions from original JobHeader)

  const getCleanJobTitle = (
    jobTitle: string,
    companyName: string,
    location: string
  ): string => {
    const rawTitle = jobTitle || "";
    const company = companyName || "";

    // let log = rawTitle;

    let title = rawTitle;

    if (company && title.toLowerCase().includes(company.toLowerCase())) {
      // Remove company name and any following punctuation/whitespace
      const regex = new RegExp(
        company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
          "(?:[,-:|]|- | -)*\\s*",
        "i"
      );
      title = title.replace(regex, "");
    }

    // log += ", " + title;

    // Remove anything in parentheses (including the parentheses themselves), globally
    title = title.replace(/\s*\([^)]*\)/g, "").trim();

    // log += ", " + title;
    // Remove location if present after a dash, comma, or pipe
    // e.g. "Manager - New York, NY", "Manager | Remote", "Manager, San Francisco"
    // Only remove if the dash is surrounded by spaces (e.g., " - "), not if it's like "Manager-Remote"
    title = title.replace(/(?:\s[-|,:]\s+)[\w\s\.,\-&\/\(\)]+$/, "").trim();
    title = title.replace(location, "").trim();
    // log += ", " + title;

    // Remove trailing whitespace and punctuation
    title = title.replace(/[\s\-|,:]+$/, "").trim();
    // log += ", " + title;

    // console.log(log);

    return title;
  };

  // Returns a string like "6h", "2d", "3w", "1mo", "2y" for how long since the date
  function getTimeSince(dateString: string): string {
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
    const months = Math.floor(days / 30.44); // average month
    const years = Math.floor(days / 365.25);

    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}mo`;
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  const getCompensation = (compensation: CompensationRange) => {
    const format = (min: number | null, max: number | null, unit: string) => {
      const minNum = typeof min === "string" ? parseFloat(min) : min;
      const maxNum = typeof max === "string" ? parseFloat(max) : max;

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
      if (minNum != null)
        return `${formatValue(minNum, isHourly)}${displayUnit}`;
      if (maxNum != null)
        return `${formatValue(maxNum, isHourly)}${displayUnit}`;
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

  const getLocation = (location: string) => {
    const splitLocation = location.split(",");
    if (splitLocation.length > 2)
      return splitLocation[0] + ", " + formatState(splitLocation[1]);
    return location;
  };

  const getLocations = (location: string) => {
    // Split by " or " to handle multiple locations
    const locations = location
      .split(" or ")
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);
    return locations.map((loc) => getLocation(loc));
  };

  const formatState = (state: string) => {
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

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {getCleanJobTitle(jobTitle, companyName, location)}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1 ">
          {getLocations(location).map((loc, index) => (
            <LocationBadge key={index} location={loc} />
          ))}
          {getCompensation(compensation) && (
            <span className="flex items-center bg-pink-400/75 dark:bg-gray-700/75 rounded-md w-fit pl-1 px-2 py-0.5 text-black dark:text-pink-500/85">
              <DollarSign className="w-3 h-3 " />
              {getCompensation(compensation)}
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeSince(publishDate)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            HiringCafe scraped this job {getTimeSince(publishDate)} ago
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default JobHeader;
