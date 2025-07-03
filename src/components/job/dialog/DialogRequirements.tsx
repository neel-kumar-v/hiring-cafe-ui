import { MorphingJobDescription } from "@/components/ui/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DialogRequirements = ({
  requirementsSummary,
}: {
  requirementsSummary: string;
}) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { prefersReducedMotion } = useReducedMotion();
  if (!requirementsSummary) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-gray-900 text-lg dark:text-white">
        Requirements
      </h3>
      {isDesktop && !prefersReducedMotion ? (
        <MorphingJobDescription className="text-gray-700 leading-relaxed dark:text-gray-300">
          {requirementsSummary}
        </MorphingJobDescription>
      ) : (
        <div className="text-gray-700 leading-relaxed dark:text-gray-300">
          {requirementsSummary}
        </div>
      )}
    </div>
  );
};

export default DialogRequirements;
