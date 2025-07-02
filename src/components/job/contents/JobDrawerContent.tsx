import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { Job } from "@/types/jobs";
import {
	DialogBadges,
	DialogJobDescription,
	DialogJobTitle,
	DialogRequirements,
	DialogSkills,
} from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import { DialogActionButtons } from "../dialog/DialogFooter";

const JobDrawerContent = ({
	currentJob,
	isBookmarked,
	isApplied,
	onBookmarkToggle,
	onApplyToggle,
	open,
	onClose,
}: {
	currentJob: Job;
	isBookmarked: boolean;
	isApplied: boolean;
	onBookmarkToggle: () => void;
	onApplyToggle: () => void;
	open: boolean;
	onClose: () => void;
}) => {
	return (
		<Drawer onOpenChange={onClose} open={open}>
			<DrawerContent className="w-full max-w-full rounded-t-xl">
				<VisuallyHidden>
					<DialogTitle>Job Details</DialogTitle>
				</VisuallyHidden>
				<div className="sticky top-0 z-10 border-gray-200 p-2 max-sm:border-b dark:border-gray-700">
					<DialogActionButtons
						isApplied={isApplied}
						isBookmarked={isBookmarked}
						onApplyToggle={onApplyToggle}
						onBookmarkToggle={onBookmarkToggle}
					/>
				</div>
				<div className="space-y-4 overflow-y-auto p-4">
					<DialogJobTitle
						companyName={currentJob.v5_processed_company_data.name}
						jobTitle={currentJob.job_information.title}
						workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
					/>
					<DialogCompanyLogoCard
						companyData={currentJob.v5_processed_company_data}
					/>
					<DialogBadges
						commitments={currentJob.v5_processed_job_data.commitment}
						compensation={{
							yearly_min_compensation:
								currentJob.v5_processed_job_data.yearly_min_compensation,
							yearly_max_compensation:
								currentJob.v5_processed_job_data.yearly_max_compensation,
							monthly_min_compensation:
								currentJob.v5_processed_job_data.monthly_min_compensation,
							monthly_max_compensation:
								currentJob.v5_processed_job_data.monthly_max_compensation,
							weekly_min_compensation:
								currentJob.v5_processed_job_data.weekly_min_compensation,
							weekly_max_compensation:
								currentJob.v5_processed_job_data.weekly_max_compensation,
							hourly_min_compensation:
								currentJob.v5_processed_job_data.hourly_min_compensation,
							hourly_max_compensation:
								currentJob.v5_processed_job_data.hourly_max_compensation,
							"bi-weekly_min_compensation":
								currentJob.v5_processed_job_data["bi-weekly_min_compensation"],
							"bi-weekly_max_compensation":
								currentJob.v5_processed_job_data["bi-weekly_max_compensation"],
							daily_min_compensation:
								currentJob.v5_processed_job_data.daily_min_compensation,
							daily_max_compensation:
								currentJob.v5_processed_job_data.daily_max_compensation,
						}}
						workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
						workType={currentJob.v5_processed_job_data.workplace_type}
					/>
					<DialogRequirements
						requirementsSummary={
							currentJob.v5_processed_job_data.requirements_summary
						}
					/>
					<DialogSkills
						technicalTools={currentJob.v5_processed_job_data.technical_tools}
					/>
					<DialogJobDescription
						description={currentJob.job_information.description}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default JobDrawerContent;
