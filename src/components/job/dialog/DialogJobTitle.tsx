import React from "react";
import {
	MorphingCompanyName,
	MorphingJobTitle,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatCompanyName, getCleanJobTitle } from "@/lib/utils";

const DialogJobTitle = ({
	jobTitle,
	companyName,
	workplaceCities,
}: {
	jobTitle: string;
	companyName: string;
	workplaceCities: string[];
}) => {
	const isDesktop = useMediaQuery("(min-width: 640px)");
	const locationForTitle = workplaceCities.length > 0 ? workplaceCities[0] : "";
	const cleanTitle = getCleanJobTitle(jobTitle, companyName, locationForTitle);
	const className =
		"z-20 mb-4 flex flex-row flex-wrap items-center gap-2 border-gray-200 py-4 font-bold text-3xl text-gray-900 sm:border-b md:pt-6 dark:border-gray-700 dark:text-white";
	return isDesktop ? (
		<MorphingJobTitle className={className}>
			{cleanTitle}{" "}
			<MorphingCompanyName>
				@ {formatCompanyName(companyName)}
			</MorphingCompanyName>
		</MorphingJobTitle>
	) : (
		<div className={className}>
			{cleanTitle} <span>@ {formatCompanyName(companyName)}</span>
		</div>
	);
};

export default DialogJobTitle;
