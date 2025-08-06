import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { useApp } from "@/contexts/AppContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useMemo } from "react";
import UniversalTooltip from "../../util/UniversalTooltip";

interface CardSkillMatchProps {
  technicalTools?: string[];
}

const CardSkillMatch = ({ technicalTools }: CardSkillMatchProps) => {
  const { user } = useApp();
  const { isDarkMode } = useDarkMode();

  const skillMatchData = useMemo(() => {
    if (!technicalTools || technicalTools.length === 0) {
      return { percentage: 0, matchedSkills: [], totalSkills: 0, matchedSkillNames: [] };
    }

    // Normalize skills for comparison (case-insensitive, remove special chars)
    const normalizeSkill = (skill: string) => {
      return skill.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };

    const normalizedUserSkills = user.skills.map(normalizeSkill);
    const normalizedJobTools = technicalTools.map(normalizeSkill);

    // Find exact matches only
    const matchedSkills = normalizedUserSkills.filter(userSkill =>
      normalizedJobTools.includes(userSkill)
    );

    // Find the original skill names that matched
    const matchedSkillNames = user.skills.filter(userSkill => {
      const normalizedUserSkill = normalizeSkill(userSkill);
      return matchedSkills.includes(normalizedUserSkill);
    });

    const percentage = Math.round((matchedSkills.length / technicalTools.length) * 100);
    
    return {
      percentage: Math.min(percentage, 100), // Cap at 100%
      matchedSkills,
      totalSkills: technicalTools.length,
      matchedSkillNames
    };
  }, [user.skills, technicalTools]);

  const primaryColor = isDarkMode
    ? "rgb(219 39 119 / 0.7)" // tailwind pink-500 at 70% opacity
    : "rgb(244 114 182 / 0.7)"; // tailwind pink-400 at 70% opacity
  const secondaryColor = isDarkMode ? "rgba(247, 247, 247, 0.10)" : "rgba(247, 247, 247, 0.80)";

  if (!technicalTools || technicalTools.length === 0) {
    return (
      <div className="col-span-1 flex justify-end">
      </div>
    );
  }

  const tooltipContent = skillMatchData.matchedSkillNames.length > 0
    ? `${skillMatchData.matchedSkillNames.length} / ${skillMatchData.totalSkills} matched.`
    : `0 / ${skillMatchData.totalSkills} matched`;

  return (
    <div className="col-span-1 flex justify-end">
      <UniversalTooltip content={tooltipContent}>
        <div className="flex flex-col items-center cursor-help">
          <AnimatedCircularProgressBar
            value={skillMatchData.percentage}
            max={100}
            min={0}
            gaugePrimaryColor={primaryColor}
            gaugeSecondaryColor={secondaryColor}
            className="size-10"
            textClassName="text-[14px]"
          />
        </div>
      </UniversalTooltip>
    </div>
  );
};

export default CardSkillMatch;
