import React from "react";
import { MorphingJobTechnicalTools } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const DialogSkills = ({ technicalTools }: { technicalTools: string[] }) => {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  if (!technicalTools || technicalTools.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Skills
      </h3>
      {isDesktop ? (
        <MorphingJobTechnicalTools>
          <div className="flex flex-wrap gap-2">
            {technicalTools.map((tool, index) => (
              <span
                key={index}
                className="text-black/65 dark:text-pink-400 bg-pink-100 dark:bg-pink-700/50 px-3 py-1 rounded-md text-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        </MorphingJobTechnicalTools>
      ) : (
        <div className="flex flex-wrap gap-2">
          {technicalTools.map((tool, index) => (
            <span
              key={index}
              className="text-black/65 dark:text-pink-400 bg-pink-100 dark:bg-pink-700/50 rounded-lg px-3 py-1 text-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DialogSkills;
