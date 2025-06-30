import React, { useState } from "react";
import { Link2, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MorphingCompanyLogo,
  MorphingCompanyName,
} from "@/components/ui/morphing-dialog";
import { V5ProcessedCompanyData } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  renderCompanyAbbreviationGrid,
  getCompanyAbbreviation,
  formatCompanyName,
} from "@/lib/utils";

const CompanyInfo = ({
  companyData,
}: {
  companyData: V5ProcessedCompanyData;
}) => {
  const [imageError, setImageError] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  return (
    <div className="flex group items-start space-x-2 mb-3">
      {isDesktop ? (
        <MorphingCompanyLogo
          className={`h-14  aspect-square rounded flex items-center justify-center flex-shrink-0 overflow-hidden${
            companyData.image_url && !imageError
              ? ""
              : " bg-pink-100 dark:bg-pink-800/15"
          }`}
        >
          {companyData.image_url && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyData.image_url}
              alt={companyData.name}
              className="w-full h-full object-contain p-0.75 rounded-[6px]"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-pink-600 dark:text-pink-300 font-semibold text-md">
              {renderCompanyAbbreviationGrid(
                getCompanyAbbreviation(companyData.name || "")
              )}
            </span>
          )}
        </MorphingCompanyLogo>
      ) : (
        <div
          className={`h-14 aspect-square rounded flex items-center justify-center flex-shrink-0 overflow-hidden${
            companyData.image_url && !imageError
              ? ""
              : " bg-pink-100 dark:bg-pink-800/15"
          }`}
        >
          {companyData.image_url && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyData.image_url}
              alt={companyData.name}
              className="w-full h-full object-contain p-0.75 rounded-[6px]"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-pink-600 dark:text-pink-300 font-semibold text-md">
              {renderCompanyAbbreviationGrid(
                getCompanyAbbreviation(companyData.name || "")
              )}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="overflow-visible whitespace-nowrap group-hover:backdrop-blur-xl rounded group-hover:w-fit">
          {companyData.name ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={
                      companyData.website
                        ? companyData.website.startsWith("http")
                          ? companyData.website
                          : `https://${companyData.website}`
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit font-medium text-gray-900 dark:text-white text-sm line-clamp-1 hover:underline transition-all duration-200 inline-flex items-center"
                    tabIndex={0}
                    style={{ overflow: "visible" }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span
                      className="flex items-center transition-all duration-300 ease-out group-hover:translate-x-0 -translate-x-3   opacity-0 group-hover:opacity-100 -mr-3 group-hover:-mr-1"
                      aria-hidden="true"
                    >
                      <Link2 className="size-3 text-gray-400 dark:text-gray-300 -rotate-45" />
                    </span>
                    <MorphingCompanyName className="transition-transform duration-300 ease-out group-hover:translate-x-2 inline-block">
                      {formatCompanyName(companyData.name)}
                    </MorphingCompanyName>
                  </a>
                </TooltipTrigger>
                <TooltipContent>Visit company site</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="ml-2 group-hover:ml-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 dark:text-pink-400 dark:hover:text-pink-300 p-1 h-auto hover:underline font-normal text-xs leading-none inline-flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle view all jobs logic here
                    }}
                  >
                    <ExternalLink className="size-3 text-gray-400 dark:text-gray-300" />
                    View All
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  View all jobs from {companyData.name}
                </TooltipContent>
              </Tooltip>
            </>
          ) : isDesktop ? (
            <MorphingCompanyName className="w-fit font-medium text-gray-900 dark:text-white text-sm line-clamp-1 transition-all duration-200 inline-flex items-center">
              {formatCompanyName(companyData.name)}
            </MorphingCompanyName>
          ) : (
            <span className="w-fit font-medium text-gray-900 dark:text-white text-sm line-clamp-1 transition-all duration-200 inline-flex items-center">
              {formatCompanyName(companyData.name)}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 cursor-text">
          {companyData.tagline}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
