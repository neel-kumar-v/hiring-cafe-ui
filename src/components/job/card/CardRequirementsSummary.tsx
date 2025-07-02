import React from "react";

const CardRequirementsSummary = ({
	requirementsSummary,
}: {
	requirementsSummary: string;
}) => {
	return (
		<div className="line-clamp-3 cursor-text text-gray-700 text-xs leading-normal dark:text-gray-300">
			{requirementsSummary}
		</div>
	);
};

export default CardRequirementsSummary;
