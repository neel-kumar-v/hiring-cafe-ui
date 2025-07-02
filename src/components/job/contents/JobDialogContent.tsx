import type React from "react";
import type { Job } from "@/types/jobs";
import {
	DialogBadges,
	DialogFooter,
	DialogJobDescription,
	DialogJobTitle,
	DialogRequirements,
	DialogSkills,
	DialogStats,
} from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";

const JobDialogContent = ({
	currentJob,
	isBookmarked,
	isApplied,
	onBookmarkToggle,
	onApplyToggle,
}: {
	currentJob: Job;
	isBookmarked: boolean;
	isApplied: boolean;
	onBookmarkToggle: () => void;
	onApplyToggle: () => void;
}) => {
	const handleBookmarkClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onBookmarkToggle();
	};

	const handleApplyClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onApplyToggle();
	};

	return (
		<div className="relative p-8 pt-16">
			<DialogStats
				appliedFromUsers={currentJob.job_information.appliedFromUsers}
				isApplied={isApplied}
				isBookmarked={isBookmarked}
				onApplyClick={handleApplyClick}
				onBookmarkClick={handleBookmarkClick}
				publishDate={currentJob.v5_processed_job_data.estimated_publish_date}
				savedFromUsers={currentJob.job_information.savedFromUsers}
				viewedByUsers={currentJob.job_information.viewedByUsers}
			/>

			<DialogJobTitle
				companyName={currentJob.v5_processed_company_data.name}
				jobTitle={currentJob.job_information.title}
				workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
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

			<DialogCompanyLogoCard
				companyData={currentJob.v5_processed_company_data}
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

			<DialogFooter
				isApplied={isApplied}
				isBookmarked={isBookmarked}
				onApplyToggle={onApplyToggle}
				onBookmarkToggle={onBookmarkToggle}
			/>
		</div>
	);
};

export default JobDialogContent;
