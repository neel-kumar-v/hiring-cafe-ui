import UniversalTooltip from "@/components/util/UniversalTooltip";
import { getExperienceInfo } from "@/lib/job-info";
import { FileChartColumnIncreasing, FileUser } from "lucide-react";

const CardRequirements = ({
  requirementsSummary,
  minIndustryAndRoleYoe,
  minManagementAndLeadershipYoe,
}: {
  requirementsSummary: string;
  minIndustryAndRoleYoe?: number | null;
  minManagementAndLeadershipYoe?: number | null;
}) => {
  const experienceInfo = getExperienceInfo(
    minIndustryAndRoleYoe,
    minManagementAndLeadershipYoe
  );

  return (
    <div className="line-clamp-3 cursor-text text-foreground/80 text-xs leading-normal dark:text-foreground/80">
      {experienceInfo.hasAny && (
        <>
          {experienceInfo.industryBadge && experienceInfo.leadershipBadge ? (
            <>
              <UniversalTooltip content={experienceInfo.industryTooltip!}>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                  <FileChartColumnIncreasing className="w-3 h-3" />
                  {experienceInfo.industryBadge}
                </span>
              </UniversalTooltip>
              <UniversalTooltip content={experienceInfo.leadershipTooltip!}>
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                  <FileUser className="w-3 h-3" />
                  {experienceInfo.leadershipBadge}
                </span>
              </UniversalTooltip>
            </>
          ) : (
            <>
              {experienceInfo.industryBadge && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                  <FileChartColumnIncreasing className="w-3 h-3" />
                  {experienceInfo.industryBadge}
                </span>
              )}
              {experienceInfo.leadershipBadge && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs dark:bg-secondary dark:text-foreground/80 mr-2">
                  <FileUser className="w-3 h-3" />
                  {experienceInfo.leadershipBadge}
                </span>
              )}
            </>
          )}
        </>
      )}
      {requirementsSummary}
    </div>
  );
};

export default CardRequirements;
