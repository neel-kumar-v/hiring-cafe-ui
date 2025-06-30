import React from "react";
import { MorphingCompanyName, MorphingJobTitle } from "@/components/ui/morphing-dialog";
import { formatCompanyName, getCleanJobTitle } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DialogJobTitle = ({
  jobTitle,
  companyName,
  location,
}: {
  jobTitle: string;
  companyName: string;
  location: string;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const cleanTitle = getCleanJobTitle(jobTitle, companyName, location);
  return isDesktop ? (
    <MorphingJobTitle className="sticky top-0 z-20 bg-white dark:bg-gray-800 text-3xl font-bold text-gray-900 dark:text-white mb-4 flex flex-row flex-wrap items-center gap-2 py-4 pt-6 border-b border-gray-200 dark:border-gray-700">
      {cleanTitle}{" "}
      <MorphingCompanyName>
        @ {formatCompanyName(companyName)}
      </MorphingCompanyName>
    </MorphingJobTitle>
  ) : (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 text-3xl font-bold text-gray-900 dark:text-white mb-4 flex flex-row flex-wrap items-center gap-2 py-4 md:pt-6 border-b border-gray-200 dark:border-gray-700">
      {cleanTitle}{" "}
      <span>
        @ {formatCompanyName(companyName)}
      </span>
    </div>
  );
};

export default DialogJobTitle;
