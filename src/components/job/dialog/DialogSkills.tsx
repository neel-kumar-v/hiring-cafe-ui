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
                className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-1 text-sm"
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
              className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg px-3 py-1 text-sm"
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
