import { formatTool } from "@/lib/job-info";
import { MorphingJobTechnicalTools } from "../../ui/motion/morphing-dialog";

const CardTechnicalTools = ({ technicalTools }: { technicalTools: string[] }) => {
  if (!technicalTools || technicalTools.length === 0) return null;

  const minHeight = 12;

  const maxHeight = () => {
    const combined = technicalTools.join("  ");
    return Math.max(12, Math.ceil(combined.length / 50 + 1) * 6);
  };

  return (
    <div className="flex grow min-w-0 flex-wrap items-center gap-1">
      <MorphingJobTechnicalTools
        className={`flex pointer-fine:max-h-${minHeight}  pointer-fine:group-hover:max-h-${maxHeight} max-h-${minHeight} pointer-fine:motion-reduce:max-h-${minHeight} min-w-0 flex-wrap gap-1 overflow-hidden transition-all duration-700 ease-out`}
      >
        {technicalTools.map((skill, skillIndex) => (
          <span
            className="max-w-xs cursor-text truncate rounded-md bg-pink-100 px-1.5 py-0.5 text-black/65 text-xs dark:bg-pink-700/50 dark:text-pink-400"
            key={skillIndex}
            style={{ whiteSpace: "nowrap" }}
            title={skill}
          >
            {formatTool(skill)}
          </span>
        ))}
      </MorphingJobTechnicalTools>
    </div>
  );
};

export default CardTechnicalTools;
