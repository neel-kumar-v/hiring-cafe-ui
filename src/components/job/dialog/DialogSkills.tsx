import { MorphingJobTechnicalTools } from "@/components/ui/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatTool } from "@/lib/utils";

const DialogSkills = ({ technicalTools }: { technicalTools: string[] }) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const { prefersReducedMotion } = useReducedMotion();
  if (!technicalTools || technicalTools.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-gray-900 text-lg dark:text-white">
        Skills
      </h3>
      {isDesktop && !prefersReducedMotion ? (
        <MorphingJobTechnicalTools>
          <div className="flex flex-wrap gap-2">
            {technicalTools.map((tool, index) => (
              <span
                className="rounded-md bg-pink-100 px-3 py-1 text-black/65 text-sm dark:bg-pink-700/50 dark:text-pink-400"
                key={index}
              >
                {formatTool(tool)}
              </span>
            ))}
          </div>
        </MorphingJobTechnicalTools>
      ) : (
        <div className="flex flex-wrap gap-2">
          {technicalTools.map((tool, index) => (
            <span
              className="rounded-lg bg-pink-100 px-3 py-1 text-black/65 text-sm dark:bg-pink-700/50 dark:text-pink-400"
              key={index}
            >
              {formatTool(tool)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DialogSkills;
