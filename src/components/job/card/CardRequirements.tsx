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
    <div className="line-clamp-3 cursor-text text-neutral-700 text-xs leading-normal dark:text-neutral-300">
      {experienceInfo.hasAny && (
        <>
          {experienceInfo.industryBadge && experienceInfo.leadershipBadge ? (
            <>
              <UniversalTooltip content={experienceInfo.industryTooltip!}>
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 text-xs dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
                  <FileChartColumnIncreasing className="w-3 h-3" />
                  {experienceInfo.industryBadge}
                </span>
              </UniversalTooltip>
              <UniversalTooltip content={experienceInfo.leadershipTooltip!}>
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 text-xs dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
                  <FileUser className="w-3 h-3" />
                  {experienceInfo.leadershipBadge}
                </span>
              </UniversalTooltip>
            </>
          ) : (
            <>
              {experienceInfo.industryBadge && (
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 text-xs dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
                  <FileChartColumnIncreasing className="w-3 h-3" />
                  {experienceInfo.industryBadge}
                </span>
              )}
              {experienceInfo.leadershipBadge && (
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 text-xs dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
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
