import React from "react";
import { MorphingJobDescription } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DialogRequirements = ({
  requirementsSummary,
}: {
  requirementsSummary: string;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  if (!requirementsSummary) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Requirements
      </h3>
      {isDesktop ? (
        <MorphingJobDescription className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {requirementsSummary}
        </MorphingJobDescription>
      ) : (
        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {requirementsSummary}
        </div>
      )}
    </div>
  );
};

export default DialogRequirements;
