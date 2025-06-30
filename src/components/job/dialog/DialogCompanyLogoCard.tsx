import React, { useState } from "react";
import { MorphingCompanyLogo } from "@/components/ui/morphing-dialog";
import { V5ProcessedCompanyData } from "@/types/jobs";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const abbreviation = getCompanyAbbreviation(companyData.name || "");
  const initialsContent = renderCompanyAbbreviationGrid(abbreviation);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  return (
    <div className="items-center gap-8 my-4 min-h-[120px] hidden sm:flex">
      {isDesktop ? (
        <MorphingCompanyLogo
          className={`h-24 aspect-square rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden  bg-white dark:bg-gray-900 ${
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
              className="w-full h-full object-contain rounded-xl drop-shadow-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-800/15 font-semibold text-3xl flex items-center justify-center w-full h-full select-none">
              {initialsContent}
            </span>
          )}
        </MorphingCompanyLogo>
      ) : (
        <div
          className={`h-24 aspect-square rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white dark:bg-gray-900 ${
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
              className="w-full h-full object-contain rounded-xl drop-shadow-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-pink-600 dark:text-pink-300 bg-pink-100 dark:bg-pink-800/15 font-semibold md:text-3xl text-5xl flex items-center justify-center w-full h-full select-none">
              {initialsContent}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 flex flex-col justify-center min-w-0 h-full">
        <p className="text-gray-700 dark:text-gray-300 md:leading-relaxed md:text-base break-words line-clamp-5">
          {companyData.tagline || (
            <span className="italic text-gray-400">
              No description provided.
            </span>
          )}
          <span className="p-0 ml-2 text-sm md:text-base text-pink-800 dark:text-pink-300 hover:underline">
            Show more company info
          </span>
        </p>
      </div>
    </div>
  );
};

export default DialogCompanyLogoCard;
