import { Button } from "@/components/ui/button";
import { MorphingCompanyLogo } from "@/components/ui/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  analyzeImageBackground,
  getCompanyAbbreviation,
  getImageBackgroundClass,
  renderCompanyAbbreviationGrid,
} from "@/lib/company-info";
import type { V5ProcessedCompanyData } from "@/types/job";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import DialogExtendedCompanyInfo from "./DialogExtendedCompanyInfo";

const DialogCompanyLogoCard = ({
  companyData,
}: {
  companyData: V5ProcessedCompanyData;
}) => {
  const [imageError, setImageError] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"light" | "dark" | null>(null);
  const abbreviation = getCompanyAbbreviation(companyData.name || "");
  const initialsContent = renderCompanyAbbreviationGrid(abbreviation);
  const isDesktop = useMediaQuery("(min-width: 728px)");
  const { prefersReducedMotion } = useReducedMotion();

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

  const removeHtmlTags = (str: string) => {
    let result = str.replace(/<[^>]*>/g, "");
    const htmlEntities: { [key: string]: string } = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
    };
    result = result.replace(/&[a-zA-Z#0-9]+;/g, (entity) => {
      return htmlEntities[entity] !== undefined ? htmlEntities[entity] : "";
    });
    return result;
  };

  return (
    <div className="my-4 min-h-[120px] items-center gap-x-8 flex flex-col">
      <div className="w-full flex flex-row items-center gap-x-8">
        {isDesktop && !prefersReducedMotion ? (
          <MorphingCompanyLogo
            className={`flex aspect-square h-32 flex-shrink-0 items-center justify-center overflow-hidden self-start rounded-xl ${backgroundClass}`}
          >
            {companyData.image_url && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={companyData.name}
                className="h-full w-full rounded-xl object-contain drop-shadow-lg"
                onError={() => setImageError(true)}
                src={companyData.image_url}
              />
            ) : (
              <span className="flex h-full w-full select-none items-center justify-center bg-pink-100 font-semibold text-3xl text-pink-600 dark:bg-pink-800/15 dark:text-pink-300">
                {initialsContent}
              </span>
            )}
          </MorphingCompanyLogo>
        ) : (
          <div
            className={`flex aspect-square h-24 flex-shrink-0 items-center justify-center overflow-hidden self-start rounded-xl ${backgroundClass}`}
          >
            {companyData.image_url && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={companyData.name}
                className="h-full w-full rounded-xl object-contain drop-shadow-lg"
                onError={() => setImageError(true)}
                src={companyData.image_url}
              />
            ) : (
              <span className="flex h-full w-full select-none items-center justify-center bg-pink-100 font-semibold text-5xl text-pink-600 md:text-3xl dark:bg-pink-800/15 dark:text-pink-300">
                {initialsContent}
              </span>
            )}
          </div>
        )}
        <div className="flex h-full min-w-0 flex-1 flex-col justify-center">
          <p className="line-clamp-5 break-words text-neutral-700 md:text-base md:leading-relaxed dark:text-neutral-300">
            {removeHtmlTags(companyData.tagline || "") || (
              <span className="text-neutral-400 italic">
                No description provided.
              </span>
            )}
          </p>
        </div>
      </div>
      {showExtended && (
        <div className="w-full">
          <DialogExtendedCompanyInfo companyData={companyData} />
        </div>
      )}
      <div className="sm:mt-6 mt-9 mb-3 sm:mb-0 border-t pt-1.5 border-neutral-200 dark:border-neutral-700 w-full flex justify-center">
        <Button
          className="rounded-sm border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 -my-6"
          onClick={() => setShowExtended((v) => !v)}
          size="sm"
          variant="outline"
        >
          {showExtended ? (
            <ChevronUp className="mr-2 size-4" />
          ) : (
            <ChevronDown className="mr-2 size-4" />
          )}
          {showExtended ? "Show less" : "Show more company info"}
        </Button>
      </div>
    </div>
  );
};

export default DialogCompanyLogoCard;
