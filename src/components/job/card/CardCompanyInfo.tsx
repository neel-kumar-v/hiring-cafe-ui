import {
  MorphingCompanyName,
} from "@/components/ui/motion/morphing-dialog";
import {
  formatCompanyName,
} from "@/lib/company-info";
import type { V5ProcessedCompanyData } from "@/types/job";
import { ExternalLink, Link2 } from "lucide-react";
import UniversalTooltip from "../../util/UniversalTooltip";
import CompanyLogo from "../util/CompanyLogo";

const CardCompanyInfo = ({
  companyData,
  tagline,
}: {
  companyData: V5ProcessedCompanyData;
  tagline: string;
}) => {



  return (
    <div className="group mb-3 flex items-start space-x-2">
      <CompanyLogo
        companyData={companyData}
        size="md"
        variant="card"
        useMorphing={true}
      />
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
