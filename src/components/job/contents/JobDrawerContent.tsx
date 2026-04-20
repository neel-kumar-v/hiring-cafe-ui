import { DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { CompanyDTO, JobDTO, JobDetailsResultDTO } from "@/types/convexJobs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useQuery } from "convex/react";
import { DialogBadges, DialogJobDescription, DialogJobTitle, DialogRequirements, DialogSkills } from "../dialog";
import DialogCompanyLogoCard from "../dialog/DialogCompanyLogoCard";
import { DialogActionButtons } from "../dialog/DialogFooter";
import DialogResponsibilities from "../dialog/DialogResponsibilities";
import { api } from "../../../../convex/_generated/api";

const JobDrawerContent = ({
  currentJob,
  company,
  isBookmarked,
  isApplied,
  onBookmarkToggle,
  onApplyToggle,
  open,
  onClose,
}: {
  currentJob: JobDTO;
  company: CompanyDTO | null;
  isBookmarked: boolean;
  isApplied: boolean;
  onBookmarkToggle: () => void;
  onApplyToggle: () => void;
  open: boolean;
  onClose: () => void;
}) => {
  const details = useQuery(api.jobs.getDetails, open ? { jobId: currentJob._id as any } : "skip") as unknown as JobDetailsResultDTO | null;
  const job = details?.job ?? currentJob;
  const detailsDoc = details?.details ?? null;
  const companyDoc = details?.company ?? company;

  const companyData = {
    name: companyDoc?.name ?? "",
    website: companyDoc?.homepageUri ?? "",
    image_url: companyDoc?.imageUrl ?? "",
    tagline: companyDoc?.tagline ?? "",
    subsidiaries: [],
    parent_company: "",
    linkedin_url: "",
    industries: companyDoc?.industries ?? [],
    activities: companyDoc?.activities ?? [],
    is_non_profit: false,
    is_public_company: false,
    is_dissolved: false,
    is_acquired: false,
    num_employees: companyDoc?.numEmployees ?? 0,
    year_founded: companyDoc?.yearFounded ?? 0,
    headquarters_country: companyDoc?.hqCountry ?? "",
    total_funding_amount: null,
    total_funding_currency: null,
    latest_investment_amount: null,
    latest_investment_currency: null,
    latest_investment_year: null,
    latest_investment_series: null,
    investors: [],
    stock_exchange: null,
    stock_symbol: null,
    latest_revenue: null,
    latest_revenue_currency: null,
    latest_revenue_year: null,
  };

  const processed = {
    workplace_cities: job.workplaceCities,
    technical_tools: job.skills,
    commitment: job.commitment,
    workplace_type: job.workplaceType,
    requirements_summary: job.requirementsSummary,
    min_industry_and_role_yoe: job.minIcYoe ?? null,
    min_management_and_leadership_yoe: job.minMgmtYoe ?? null,
    role_activities: detailsDoc?.roleActivities ?? [],
  };

  return (
    <Drawer onOpenChange={onClose} open={open}>
      <DrawerContent className="w-full max-w-full rounded-t-xl">
        <VisuallyHidden>
          <DialogTitle>Job Details</DialogTitle>
        </VisuallyHidden>
        <div className="sticky top-0 z-10 border-border p-2 max-sm:border-b dark:border-border">
          <DialogActionButtons
            isApplied={isApplied}
            isBookmarked={isBookmarked}
            onApplyToggle={onApplyToggle}
            onBookmarkToggle={onBookmarkToggle}
            applyUrl={job.applyUrl ?? ""}
            companyUrl={companyData.website}
          />
        </div>
        <div className="space-y-4 overflow-y-auto p-4">
          <DialogJobTitle
            companyName={companyData.name}
            jobTitle={job.title}
            workplaceCities={processed.workplace_cities ?? []}
            tools={processed.technical_tools ?? []}
          />
          <DialogCompanyLogoCard companyData={companyData} />
          <DialogBadges
            commitments={processed.commitment ?? []}
            compensation={{
              yearly_min_compensation: job.yearlyMinComp ?? null,
              yearly_max_compensation: job.yearlyMaxComp ?? null,
              monthly_min_compensation: job.monthlyMinComp ?? null,
              monthly_max_compensation: job.monthlyMaxComp ?? null,
              weekly_min_compensation: job.weeklyMinComp ?? null,
              weekly_max_compensation: job.weeklyMaxComp ?? null,
              hourly_min_compensation: job.hourlyMinComp ?? null,
              hourly_max_compensation: job.hourlyMaxComp ?? null,
              "bi-weekly_min_compensation": job.biWeeklyMinComp ?? null,
              "bi-weekly_max_compensation": job.biWeeklyMaxComp ?? null,
              daily_min_compensation: job.dailyMinComp ?? null,
              daily_max_compensation: job.dailyMaxComp ?? null,
            }}
            workplaceCities={processed.workplace_cities ?? []}
            workType={processed.workplace_type ?? ""}
            compact={true}
          />
          <DialogResponsibilities roleActivities={processed.role_activities ?? []} />
          <DialogRequirements
            requirementsSummary={processed.requirements_summary ?? ""}
            minIndustryAndRoleYoe={processed.min_industry_and_role_yoe}
            minManagementAndLeadershipYoe={processed.min_management_and_leadership_yoe}
          />
          <DialogSkills technicalTools={processed.technical_tools ?? []} />
          <DialogJobDescription description={detailsDoc?.description ?? ""} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default JobDrawerContent;
