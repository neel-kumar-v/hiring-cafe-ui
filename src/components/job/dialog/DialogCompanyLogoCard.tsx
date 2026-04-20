import { Button } from "@/components/ui/button";
import type { ProcessedCompanyData } from "@/types/job";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import DialogExtendedCompanyInfo from "./DialogExtendedCompanyInfo";
import CompanyLogo from "../util/CompanyLogo";

const DialogCompanyLogoCard = ({
  companyData,
}: {
  companyData: ProcessedCompanyData;
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
        />
        <div className="flex h-full min-w-0 flex-1 flex-col justify-center">
          <p className="line-clamp-5 break-words text-foreground/80 md:text-base md:leading-relaxed dark:text-foreground/80">
            {removeHtmlTags(companyData.tagline || "") || (
              <span className="text-muted-foreground italic">
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
      <div className="sm:mt-6 mt-9 mb-3 sm:mb-0 border-t pt-1.5 border-border dark:border-border w-full flex justify-center">
        <Button
          className="rounded-md border border-border bg-background shadow-sm hover:bg-secondary/60 dark:border-border dark:bg-card dark:hover:bg-accent -my-6"
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
