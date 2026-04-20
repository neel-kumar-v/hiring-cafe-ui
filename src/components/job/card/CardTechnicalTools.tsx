import { formatTool } from "@/lib/job-info";
import { useApp } from "@/contexts/AppContext";
import { useMemo } from "react";
import { Check } from "lucide-react";

const CardTechnicalTools = ({
  technicalTools,
  variant = "card",
}: {
  technicalTools: string[];
  variant?: "card" | "dialog";
}) => {
  const { user, addSkill, removeSkill } = useApp();
  const tools = technicalTools ?? [];

  // Create skill matching logic - similar to CardSkillMatch but for individual skills
  const skillMatchInfo = useMemo(() => {
    const normalizeSkill = (skill: string) => {
      return skill.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };

    const normalizedUserSkills = user.skills.map(normalizeSkill);
    
    return tools.map(tool => {
      const normalizedTool = normalizeSkill(tool);
      const isMatched = normalizedUserSkills.includes(normalizedTool);
      return {
        original: tool,
        normalized: normalizedTool,
        isMatched
      };
    });
  }, [user.skills, tools]);

  const handleSkillClick = (e: React.MouseEvent, skillInfo: { original: string; isMatched: boolean }) => {
    e.stopPropagation(); // Prevent card dialog from opening
    e.preventDefault();
    
    if (skillInfo.isMatched) {
      removeSkill(skillInfo.original);
    } else {
      addSkill(skillInfo.original);
    }
  };

  if (!tools.length) return null;

  const chipClass =
    variant === "dialog"
      ? "max-w-xs truncate rounded-lg px-3 py-1 text-sm transition-all duration-200 focus:outline-none"
      : "max-w-xs truncate rounded-md px-1.5 py-0.5 text-xs transition-all duration-200  focus:outline-none";

  const checkSize = variant === "dialog" ? 14 : 12;

  const unmatchedClass =
    variant === "dialog"
      ? "cursor-pointer border border-primary/20 bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/80 dark:bg-brand-soft dark:text-primary"
      : "cursor-pointer border border-primary/20 bg-brand-soft text-brand-soft-foreground hover:bg-brand-soft/80";

  const chips = skillMatchInfo.map((skillInfo, skillIndex) => (
    <button
      className={`${chipClass} ${
        skillInfo.isMatched
          ? "flex cursor-pointer items-center gap-1 bg-primary text-primary-foreground shadow-sm"
          : unmatchedClass
      }`}
      key={skillIndex}
      style={{ whiteSpace: "nowrap" }}
      title={skillInfo.isMatched ? `Remove ${skillInfo.original} from your skills` : `Add ${skillInfo.original} to your skills`}
      onClick={(e) => handleSkillClick(e, skillInfo)}
    >
      {skillInfo.isMatched && <Check size={checkSize} />}
      {formatTool(skillInfo.original)}
    </button>
  ));

  if (variant === "dialog") {
    return <div className="flex flex-wrap gap-2">{chips}</div>;
  }

  return (
    <div className="flex min-w-0 grow flex-wrap items-center gap-1 pt-0.5">
      <div className="pointer-fine:max-h-28 pointer-fine:group-hover:max-h-48 pointer-fine:motion-reduce:max-h-40 flex min-w-0 flex-wrap gap-1 overflow-y-auto overflow-x-hidden transition-[max-height] duration-500 ease-out">
        {chips}
      </div>
    </div>
  );
};

export default CardTechnicalTools;
