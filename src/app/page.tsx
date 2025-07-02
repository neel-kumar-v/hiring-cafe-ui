"use client";

import { useState } from "react";
import Header from "@/components/Header";
import JobBoard from "@/components/JobBoard";
import ApplyFormSelect from "@/components/search/legacy/ApplyFormSelect";
import DateRangePopover from "@/components/search/legacy/DateRangePopover";
import Filters from "@/components/search/legacy/Filters";
import SortPopover from "@/components/search/legacy/SortPopover";

export default function Page() {
	const [jobCount] = useState(2_057_770);
	const [companyCount] = useState(72_936);
	const [location] = useState("United States");
	const [showLegacyFilters, setShowLegacyFilters] = useState(false);

	const formatNumber = (number: number, round = 3) => {
		return (Math.round(number / 10 ** round) * 10 ** round).toLocaleString();
	};

	return (
		<div>
			<div className="min-h-screen transition-colors duration-300">
				<div className="min-h-screen bg-white dark:bg-gray-900">
					{/* Header */}
					<Header
						onToggleLegacyFilters={() =>
							setShowLegacyFilters(!showLegacyFilters)
						}
						showLegacyFilters={showLegacyFilters}
					/>

					{/* Filter Tags */}
					{showLegacyFilters && <Filters />}

					<div className="h-full overflow-scroll overflow-x-hidden">
						{showLegacyFilters && (
							<div className="mx-auto max-w-full px-2 py-4 sm:px-4 lg:px-8">
								<div className="flex items-center justify-between">
									<div className="flex flex-wrap items-center space-x-4">
										<SortPopover />
										<DateRangePopover />
										<ApplyFormSelect />
									</div>
								</div>
								<div className="mt-2 text-gray-600 text-sm dark:text-gray-400">
									About {formatNumber(jobCount, 3)} jobs from{" "}
									{formatNumber(companyCount, 3)} companies in {location}
								</div>
							</div>
						)}
						<div className="mx-auto max-w-full px-2 py-8 transition-[padding] duration-500 ease-in-out sm:px-4 lg:px-8">
							<div className="grid 3xl:grid-cols-5 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
								<JobBoard />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
