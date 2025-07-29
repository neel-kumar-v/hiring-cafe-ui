import { MorphingJobDescription } from "@/components/ui/motion/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CardRequirements from "./CardRequirements";
import CardTechnicalTools from "./CardTechnicalTools";

const CardJobDescription = ({
  requirementsSummary,
  technicalTools,
  minIndustryAndRoleYoe,
  minManagementAndLeadershipYoe,
}: {
  requirementsSummary: string;
  technicalTools: string[];
  minIndustryAndRoleYoe?: number | null;
  minManagementAndLeadershipYoe?: number | null;
}) => {
  const isDesktop = useMediaQuery("(min-width: 728px)");
  return (
    <div className="mb-3 flex flex-col gap-2">
      {isDesktop ? (
        <MorphingJobDescription>
          <CardRequirements
            requirementsSummary={requirementsSummary}
            minIndustryAndRoleYoe={minIndustryAndRoleYoe}
            minManagementAndLeadershipYoe={minManagementAndLeadershipYoe}
          />
        </MorphingJobDescription>
      ) : (
        <div>
          <CardRequirements
            requirementsSummary={requirementsSummary}
            minIndustryAndRoleYoe={minIndustryAndRoleYoe}
            minManagementAndLeadershipYoe={minManagementAndLeadershipYoe}
          />
        </div>
      )}
      {technicalTools && technicalTools.length > 0 && (
        <CardTechnicalTools technicalTools={technicalTools} />
      )}
    </div>
  );
};

export default CardJobDescription;
