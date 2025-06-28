import React from "react";

const TechnicalTools = ({ technicalTools }: { technicalTools: string[] }) => {
  if (!technicalTools || technicalTools.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-1 min-w-0">
      <div className="flex flex-wrap gap-1 min-w-0" style={{ flex: 1 }}>
        {technicalTools.map((skill, skillIndex) => (
          <span
            key={skillIndex}
            className="text-xs text-black/65 dark:text-pink-400 truncate max-w-xs bg-pink-100 dark:bg-pink-700/50 px-1.5 py-0.5 rounded-md"
            style={{ whiteSpace: "nowrap" }}
            title={skill}
          >
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TechnicalTools;
