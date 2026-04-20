import UniversalTooltip from "@/components/util/UniversalTooltip";
import { getExperienceInfo } from "@/lib/job-info";
import { FileChartColumnIncreasing, FileUser } from "lucide-react";

const DialogRequirements = ({
  requirementsSummary,
  minIndustryAndRoleYoe,
  minManagementAndLeadershipYoe,
}: {
  requirementsSummary: string;
  minIndustryAndRoleYoe?: number | null;
  minManagementAndLeadershipYoe?: number | null;
}) => {
  if (!requirementsSummary) return null;

  const experienceInfo = getExperienceInfo(
    minIndustryAndRoleYoe,
    minManagementAndLeadershipYoe
  );

  const renderBadges = () => experienceInfo.industryBadge && experienceInfo.leadershipBadge ? (
    <>
      <UniversalTooltip content={experienceInfo.industryTooltip!}>
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-sm dark:bg-secondary dark:text-foreground/80 mr-2">
          <FileChartColumnIncreasing className="w-3 h-3" />
          {experienceInfo.industryBadge}
        </span>
      </UniversalTooltip>
      <UniversalTooltip content={experienceInfo.leadershipTooltip!}>
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-sm dark:bg-secondary dark:text-foreground/80 mr-2">
          <FileUser className="w-3 h-3" />
          {experienceInfo.leadershipBadge}
        </span>
      </UniversalTooltip>
    </>
  ) : (
    <>
      {experienceInfo.industryBadge && (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-sm dark:bg-secondary dark:text-foreground/80 mr-2">
          <FileChartColumnIncreasing className="w-3 h-3" />
          {experienceInfo.industryBadge}
        </span>
      )}
      {experienceInfo.leadershipBadge && (
        <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-sm dark:bg-secondary dark:text-foreground/80 mr-2">
          <FileUser className="w-3 h-3" />
          {experienceInfo.leadershipBadge}
        </span>
      )}
    </>
  );

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-foreground text-lg dark:text-foreground">
        Requirements
      </h3>
      <div className="text-foreground/80 leading-relaxed dark:text-foreground/80">
        {experienceInfo.hasAny && renderBadges()}
        {requirementsSummary}
      </div>
    </div>
  );
};

export default DialogRequirements;
