import React from "react";
import { MorphingJobTechnicalTools } from "../../ui/morphing-dialog";

const CardTechnicalTools = ({
  technicalTools,
}: {
  technicalTools: string[];
}) => {
  if (!technicalTools || technicalTools.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-1 min-w-0">
      <MorphingJobTechnicalTools className="flex flex-wrap gap-1 min-w-0">
        {technicalTools.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            className="text-xs max-w-xs truncate cursor-text text-black/65 dark:text-pink-400 bg-pink-100 dark:bg-pink-700/50 px-1.5 py-0.5 rounded-md"
            style={{ whiteSpace: "nowrap" }}
            title={skill}
          >
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </span>
        ))}
      </MorphingJobTechnicalTools>
    </div>
  );
};

export default CardTechnicalTools;
