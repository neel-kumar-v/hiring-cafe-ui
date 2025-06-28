import React from "react";

const JobRequirementsSummary = ({
  requirementsSummary,
}: {
  requirementsSummary: string;
}) => {
  return (
    <div className="text-xs text-gray-700 dark:text-gray-300 leading-normal line-clamp-3 cursor-text">
      {requirementsSummary}
    </div>
  );
};

export default JobRequirementsSummary;
