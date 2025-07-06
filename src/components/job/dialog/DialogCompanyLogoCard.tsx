import { Button } from "@/components/ui/button";
import { MorphingCompanyLogo } from "@/components/ui/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { V5ProcessedCompanyData } from "@/types/jobs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import DialogExtendedCompanyInfo from "./DialogExtendedCompanyInfo";

function getCompanyAbbreviation(companyName: string) {
  if (!companyName) return "";
  return companyName
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
}

function renderCompanyAbbreviationGrid(companyName: string) {
  if (companyName.length !== 4) return companyName;
  const letters = companyName.split("").map((letter) => letter.toUpperCase());
  return (
    <span className="inline-grid grid-cols-2 grid-rows-2 gap-x-0.5">
      <span className="font-bold">{letters[0]}</span>
      <span className="font-bold">{letters[1]}</span>
      <span className="font-bold">{letters[2]}</span>
      <span className="font-bold">{letters[3]}</span>
    </span>
  );
}

const DialogCompanyLogoCard = ({
  companyData,
}: {
  companyData: V5ProcessedCompanyData;
}) => {
  const [imageError, setImageError] = useState(false);
  const [showExtended, setShowExtended] = useState(false);
  const abbreviation = getCompanyAbbreviation(companyData.name || "");
  const initialsContent = renderCompanyAbbreviationGrid(abbreviation);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { prefersReducedMotion } = useReducedMotion();

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
    <div className="my-4 hidden min-h-[120px] items-center gap-x-8 sm:flex flex-col">
      <div className="w-full flex flex-row items-center gap-x-8">
        {isDesktop && !prefersReducedMotion ? (
          <MorphingCompanyLogo
            className={`flex aspect-square h-32 flex-shrink-0 items-center justify-center overflow-hidden self-start rounded-xl bg-white dark:bg-neutral-800 ${
              companyData.image_url && !imageError
                ? ""
                : " bg-pink-100 dark:bg-pink-800/15"
            }`}
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
            className={`flex aspect-square h-24 flex-shrink-0 items-center justify-center overflow-hidden self-start rounded-xl bg-white dark:bg-neutral-800 ${
              companyData.image_url && !imageError
                ? ""
                : " bg-pink-100 dark:bg-pink-800/15"
            }`}
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
      <div className="mt-6 border-t pt-1.5 border-neutral-200 dark:border-neutral-700 w-full flex justify-center">
        <Button
          className="rounded-sm border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 -my-6"
          onClick={() => setShowExtended((v) => !v)}
          size="sm"
          variant="outline"
        >
          {showExtended ? (
            <ChevronUp className="mr-2 h-4 w-4" />
          ) : (
            <ChevronDown className="mr-2 h-4 w-4" />
          )}
          {showExtended ? "Show less" : "Show more company info"}
        </Button>
      </div>
    </div>
  );
};

export default DialogCompanyLogoCard;
