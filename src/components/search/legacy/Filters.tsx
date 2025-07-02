import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import SearchDialog from "../../SearchDialog";

const filterTags = [
	"Departments",
	"Salary",
	"Commitment",
	"Experience",
	"Job Titles & Keywords",
	"Education",
	"Licenses & Certifications",
	"Security Clearance",
	"Languages",
	"Shifts & Schedules",
	"Travel Requirement",
	"Benefits & Perks",
	"Encouraged to Apply",
];

const companyTags = [
	"Company",
	"Industry",
	"Stage & Funding",
	"Size",
	"Founding Year",
];

export default function Filters() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedFilter, setSelectedFilter] = useState<string>("");

	const handleFilterClick = (filterName: string) => {
		setSelectedFilter(filterName);
		setDialogOpen(true);
	};

	return (
		<>
			<div className="border-gray-200 border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
				<div className="mx-auto max-w-full px-2 py-4 sm:px-4 lg:px-8 xl:px-12">
					<div className="flex flex-wrap gap-2">
						{filterTags.map((tag, index) => (
							<Badge
								className="cursor-pointer rounded-sm border-gray-300 bg-white text-[14px] text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								key={index}
								onClick={() => handleFilterClick(tag)}
								variant="outline"
							>
								{tag}
							</Badge>
						))}
						<span className="h-min text-2xl text-gray-500/25 leading-none dark:text-gray-400/25">
							•
						</span>
						{companyTags.map((tag, index) => (
							<Badge
								className="cursor-pointer rounded-sm border-orange-300 bg-orange-100 text-[14px] text-orange-700 transition-all duration-300 hover:bg-orange-200 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
								key={index}
								onClick={() => handleFilterClick(tag)}
								variant="outline"
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</div>

			<SearchDialog
				from={selectedFilter}
				onOpenChange={setDialogOpen}
				open={dialogOpen}
			/>
		</>
	);
}
