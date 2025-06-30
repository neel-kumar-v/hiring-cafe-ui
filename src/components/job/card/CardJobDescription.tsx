import React from "react";
import CardRequirementsSummary from "./CardRequirementsSummary";
import CardTechnicalTools from "./CardTechnicalTools";
import { MorphingJobDescription } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const CardJobDescription = ({
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
          <CardRequirementsSummary requirementsSummary={requirementsSummary} />
        </MorphingJobDescription>
      ) : (
        <div>
          <CardRequirementsSummary requirementsSummary={requirementsSummary} />
        </div>
      )}
      {technicalTools && technicalTools.length > 0 && (
        <CardTechnicalTools technicalTools={technicalTools} />
      )}
    </div>
  );
};

export default CardJobDescription;
