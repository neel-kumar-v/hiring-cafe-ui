import {
  MorphingCompanyLogo,
  MorphingCompanyName,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  analyzeImageBackground,
  formatCompanyName,
  getCompanyAbbreviation,
  getImageBackgroundClass,
  renderCompanyAbbreviationGrid,
} from "@/lib/company-info";
import type { V5ProcessedCompanyData } from "@/types/job";
import { ExternalLink, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import UniversalTooltip from "../../util/UniversalTooltip";

const CardCompanyInfo = ({
  companyData,
  tagline,
}: {
  companyData: V5ProcessedCompanyData;
  tagline: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"light" | "dark" | null>(null);
  const isDesktop = useMediaQuery("(min-width: 728px)");

  useEffect(() => {
    if (companyData.image_url && !imageError) {
      analyzeImageBackground(companyData.image_url).then(setBackgroundType);
    }
  }, [companyData.image_url, imageError]);

  const backgroundClass = getImageBackgroundClass(
    companyData.image_url,
    imageError,
    backgroundType
  );



  return (
    <div className="group mb-3 flex items-start space-x-2">
      {isDesktop ? (
        <MorphingCompanyLogo
          className={`flex aspect-square h-14 flex-shrink-0 items-center justify-center rounded overflow-hidden ${backgroundClass}`}
        >
          {companyData.image_url && !imageError ? (
            <img
              alt={companyData.name}
              className="h-full w-full rounded-[6px] object-contain p-0.75"
              onError={() => setImageError(true)}
              src={companyData.image_url}
            />
          ) : (
            <span className="font-semibold text-md max-sm:text-3xl text-pink-600 dark:text-pink-300">
              {renderCompanyAbbreviationGrid(
                getCompanyAbbreviation(companyData.name || "")
              )}
            </span>
          )}
        </MorphingCompanyLogo>
      ) : (
        <div
          className={`flex aspect-square h-14 flex-shrink-0 items-center justify-center rounded overflow-hidden ${backgroundClass}`}
        >
          {companyData.image_url && !imageError ? (
            <img
              alt={companyData.name}
              className="h-full w-full rounded-[6px] object-contain p-0.75"
              onError={() => setImageError(true)}
              src={companyData.image_url}
            />
          ) : (
            <span className="font-semibold text-md text-pink-600 dark:text-pink-300">
              {renderCompanyAbbreviationGrid(
                getCompanyAbbreviation(companyData.name || "")
              )}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="overflow-visible whitespace-nowrap rounded group-hover:w-fit group-hover:backdrop-blur-xl pointer-coarse:w-fit pointer-coarse:backdrop-blur-none pointer-none:w-fit pointer-none:backdrop-blur-none pointer-fine:motion-reduce:w-fit pointer-fine:motion-reduce:backdrop-blur-none">
          {companyData.name ? (
            <>
              <UniversalTooltip content="Visit company site">
                <a
                  className="line-clamp-1 inline-flex w-fit items-center font-medium text-neutral-900 text-sm hover:underline dark:text-white"
                  href={
                    companyData.website
                      ? companyData.website.startsWith("http")
                        ? companyData.website
                        : `https://${companyData.website}`
                      : "#"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  rel="noopener noreferrer"
                  style={{ overflow: "visible" }}
                  tabIndex={0}
                  target="_blank"
                >
                  <span
                    aria-hidden="true"
                    className="-translate-x-3 -mr-3 group-hover:-mr-1 flex items-center opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 pointer-coarse:-mr-1 pointer-coarse:translate-x-0 pointer-coarse:opacity-100 pointer-none:-mr-1 pointer-none:translate-x-0 pointer-none:opacity-100 pointer-fine:motion-reduce:-mr-1 pointer-fine:motion-reduce:translate-x-0 pointer-fine:motion-reduce:opacity-100"
                  >
                    <Link2 className="-rotate-45 size-3 text-neutral-400 dark:text-neutral-300" />
                  </span>
                  <MorphingCompanyName className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-2 pointer-coarse:translate-x-2 pointer-none:translate-x-2 pointer-fine:motion-reduce:translate-x-2">
                    {formatCompanyName(companyData.name)}
                  </MorphingCompanyName>
                </a>
              </UniversalTooltip>
              <UniversalTooltip
                content={`View all jobs from ${companyData.name}`}
              >
                <div
                  className="ml-2 z-10 inline-flex h-auto items-center gap-1 p-1 font-normal text-neutral-500 text-xs leading-none opacity-0 transition-all duration-200 hover:underline group-hover:ml-4 group-hover:opacity-100 pointer-coarse:ml-4 pointer-coarse:opacity-100 pointer-none:ml-4 pointer-none:opacity-100 pointer-fine:motion-reduce:ml-4 pointer-fine:motion-reduce:opacity-100 dark:text-pink-400 dark:hover:text-pink-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle view all jobs logic here
                  }}
                >
                  <ExternalLink className="size-3 text-neutral-400 dark:text-neutral-300" />
                  View All
                </div>
              </UniversalTooltip>
            </>
          ) : isDesktop ? (
            <MorphingCompanyName className="line-clamp-1 inline-flex w-fit items-center font-medium text-neutral-900 text-sm transition-all duration-200 dark:text-white">
              {formatCompanyName(companyData.name)}
            </MorphingCompanyName>
          ) : (
            <span className="line-clamp-1 inline-flex w-fit items-center font-medium text-neutral-900 text-sm transition-all duration-200 dark:text-white">
              {formatCompanyName(companyData.name)}
            </span>
          )}
        </div>

        <div className="line-clamp-2 cursor-text text-neutral-600 text-xs dark:text-neutral-400">
          {tagline}
        </div>
      </div>
    </div>
  );
};

export default CardCompanyInfo;
