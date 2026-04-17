import { formatTool } from "@/lib/job-info";
import { useApp } from "@/contexts/AppContext";
import { useMemo } from "react";
import { Check } from "lucide-react";

const CardTechnicalTools = ({ technicalTools }: { technicalTools: string[] }) => {
  const { user, addSkill, removeSkill } = useApp();
  const tools = technicalTools ?? [];
  
  const minHeight = 12;

  const maxHeight = () => {
    const combined = tools.join("  ");
    return Math.max(12, Math.ceil(combined.length / 50 + 1) * 6);
  };

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

  return (
    <div className="flex grow min-w-0 flex-wrap items-center gap-1">
      <div
        className={`flex pointer-fine:max-h-${minHeight}  pointer-fine:group-hover:max-h-${maxHeight} max-h-${minHeight} pointer-fine:motion-reduce:max-h-${minHeight} min-w-0 flex-wrap gap-1 overflow-hidden transition-all duration-700 ease-out`}
      >
        {skillMatchInfo.map((skillInfo, skillIndex) => (
          <button
            className={`max-w-xs truncate rounded-md px-1.5 py-0.5 text-xs transition-all duration-200  focus:outline-none ${
              skillInfo.isMatched
                ? "bg-pink-800 text-white shadow-sm cursor-pointer flex items-center gap-1"
                : "bg-pink-100 text-black/65 dark:bg-pink-700/20 dark:text-pink-400 border border-pink-200 dark:border-pink-700/30 cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-700/40"
            }`}
            key={skillIndex}
            style={{ whiteSpace: "nowrap" }}
            title={skillInfo.isMatched ? `Remove ${skillInfo.original} from your skills` : `Add ${skillInfo.original} to your skills`}
            onClick={(e) => handleSkillClick(e, skillInfo)}
          >
            {skillInfo.isMatched && <Check size={12} />}
            {formatTool(skillInfo.original)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CardTechnicalTools;
