import { Button } from "@/components/ui/button";
import type { V5ProcessedCompanyData } from "@/types/job";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import DialogExtendedCompanyInfo from "./DialogExtendedCompanyInfo";
import CompanyLogo from "../util/CompanyLogo";

const DialogCompanyLogoCard = ({
  companyData,
  dialog = true,
}: {
  companyData: V5ProcessedCompanyData;
  dialog?: boolean;
}) => {
  const [showExtended, setShowExtended] = useState(false);

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
        <CompanyLogo
          companyData={companyData}
          size="xl"
          variant="dialog"
          useMorphing={true}
        />
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
          className="rounded-md border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 -my-6"
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
