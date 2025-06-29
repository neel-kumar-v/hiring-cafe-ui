import React from "react";
import JobRequirementsSummary from "./JobRequirementsSummary";
import TechnicalTools from "./TechnicalTools";

const JobDescriptionSummary = ({
  requirementsSummary,
  technicalTools,
}: {
  requirementsSummary: string;
  technicalTools: string[];
}) => {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <JobRequirementsSummary requirementsSummary={requirementsSummary} />
      {technicalTools && technicalTools.length > 0 && (
        <TechnicalTools technicalTools={technicalTools} />
      )}
    </div>
  );
};

export default JobDescriptionSummary;
