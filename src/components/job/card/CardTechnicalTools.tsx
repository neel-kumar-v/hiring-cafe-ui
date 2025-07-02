import React from "react";
import { formatTool } from "@/lib/utils";
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
		<div className="flex min-w-0 flex-wrap items-center gap-1">
			<MorphingJobTechnicalTools className="flex max-h-12 min-w-0 flex-wrap gap-1 overflow-y-hidden">
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
