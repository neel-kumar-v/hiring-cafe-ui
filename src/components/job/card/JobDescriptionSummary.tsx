import React from "react";
import JobRequirementsSummary from "./JobRequirementsSummary";
import TechnicalTools from "./TechnicalTools";
import {
  MorphingJobDescription,
  MorphingJobTechnicalTools,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const JobDescriptionSummary = ({
  requirementsSummary,
  technicalTools,
}: {
  requirementsSummary: string;
  technicalTools: string[];
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  return (
    <div className="mb-3 flex flex-col gap-2">
      {isDesktop ? (
        <MorphingJobDescription>
          <JobRequirementsSummary requirementsSummary={requirementsSummary} />
        </MorphingJobDescription>
      ) : (
        <div>
          <JobRequirementsSummary requirementsSummary={requirementsSummary} />
        </div>
      )}
      {technicalTools &&
        technicalTools.length > 0 &&
        (isDesktop ? (
          <MorphingJobTechnicalTools>
            <TechnicalTools technicalTools={technicalTools} />
          </MorphingJobTechnicalTools>
        ) : (
          <TechnicalTools technicalTools={technicalTools} />
        ))}
    </div>
  );
};

export default JobDescriptionSummary;
