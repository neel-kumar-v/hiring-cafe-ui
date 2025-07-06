import React from "react";
import type { Job } from "@/types/jobs";
import CardCompanyInfo from "../card/CardCompanyInfo";
import CardHeader from "../card/CardHeader";
import CardJobDescription from "../card/CardJobDescription";

const JobCardContent = ({
	currentJob,
	isTransitioning,
}: {
	currentJob: Job;
	isTransitioning: boolean;
}) => {
	return (
		<div className="flex h-full flex-col">
			<div
				className={`transition-opacity duration-300 ease-in-out ${
					isTransitioning ? "opacity-0" : "opacity-100"
				}`}
			>
				<CardHeader
					tools={currentJob.v5_processed_job_data.technical_tools}
					commitments={currentJob.v5_processed_job_data.commitment}
					companyName={currentJob.v5_processed_company_data.name}
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
					jobTitle={currentJob.job_information.title}
					postedAt={currentJob.v5_processed_job_data.estimated_publish_date}
					workplaceCities={currentJob.v5_processed_job_data.workplace_cities}
					workType={currentJob.v5_processed_job_data.workplace_type}
				/>

				<CardCompanyInfo
					companyData={currentJob.v5_processed_company_data}
					tagline={currentJob.v5_processed_job_data.company_tagline || ""}
				/>

				<CardJobDescription
					requirementsSummary={
						currentJob.v5_processed_job_data.requirements_summary
					}
					technicalTools={currentJob.v5_processed_job_data.technical_tools}
				/>
			</div>
		</div>
	);
};

export default JobCardContent;
