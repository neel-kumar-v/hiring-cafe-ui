import { MorphingJobDescription } from "@/components/ui/morphing-dialog";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { prefersReducedMotion } = useReducedMotion();

  if (!requirementsSummary) return null;

  const experienceInfo = getExperienceInfo(
    minIndustryAndRoleYoe,
    minManagementAndLeadershipYoe
  );

  const renderBadges = () => (
    <>
      {experienceInfo.industryBadge && (
        <UniversalTooltip content={experienceInfo.industryTooltip!}>
          <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-neutral-600 text-sm dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
            <FileChartColumnIncreasing className="w-4 h-4" />
            {experienceInfo.industryBadge}
          </span>
        </UniversalTooltip>
      )}
      {experienceInfo.leadershipBadge && (
        <UniversalTooltip content={experienceInfo.leadershipTooltip!}>
          <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-neutral-600 text-sm dark:bg-neutral-700/50 dark:text-neutral-300 mr-2">
            <FileUser className="w-4 h-4" />
            {experienceInfo.leadershipBadge}
          </span>
        </UniversalTooltip>
      )}
    </>
  );

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-neutral-900 text-lg dark:text-white">
        Requirements
      </h3>
      {isDesktop && !prefersReducedMotion ? (
        <MorphingJobDescription className="text-neutral-700 leading-relaxed dark:text-neutral-300">
          {experienceInfo.hasAny && renderBadges()}
          {requirementsSummary}
        </MorphingJobDescription>
      ) : (
        <div className="text-neutral-700 leading-relaxed dark:text-neutral-300">
          {experienceInfo.hasAny && renderBadges()}
          {requirementsSummary}
        </div>
      )}
    </div>
  );
};

export default DialogRequirements;
