"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Send,
  Wrench,
  ExternalLink,
  Share2,
  EyeOff,
  Flag,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import jobsData from "@/data/jobs_data.json";
import { Job, JobCollection, V5ProcessedCompanyData } from "@/types/jobs";

// JobRequirementsSummary Component
function JobRequirementsSummary({
  requirementsSummary,
}: {
  requirementsSummary: string;
}) {
  return (
    <div className="text-xs text-gray-700 dark:text-gray-300 leading-normal line-clamp-3 cursor-text">
      {requirementsSummary}
    </div>
  );
}

// TechnicalTools Component
function TechnicalTools({ technicalTools }: { technicalTools: string[] }) {
  if (!technicalTools || technicalTools.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center flex-wrap gap-1 min-w-0">
      <Wrench className="size-4 mr-2 inline text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <div className="flex flex-wrap gap-1 min-w-0" style={{ flex: 1 }}>
        {technicalTools.map((skill, skillIndex) => (
          <Badge
            key={skillIndex}
            variant="secondary"
            className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs"
            style={{ whiteSpace: "nowrap" }}
            title={skill}
          >
            {skill.charAt(0).toUpperCase() + skill.slice(1)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// StatIcon Component
function StatIcon({
  icon: Icon,
  count,
  tooltipText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  tooltipText: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex items-center space-x-1">
          <Icon className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
          <span>{count}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// JobStats Component
function JobStats({
  viewedByUsers = [],
  savedFromUsers = [],
  appliedFromUsers = [],
}: {
  viewedByUsers?: string[];
  savedFromUsers?: string[];
  appliedFromUsers?: string[];
}) {
  const viewedCount = viewedByUsers.length + 1; // +1 for current user
  const savedCount = savedFromUsers.length;
  const appliedCount = appliedFromUsers.length;

  return (
    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
      <StatIcon
        icon={Eye}
        count={viewedCount}
        tooltipText={
          viewedCount === 1
            ? "Only viewed by you"
            : `Viewed by ${viewedCount} users`
        }
      />
      <StatIcon
        icon={Bookmark}
        count={savedCount}
        tooltipText={
          savedCount === 0
            ? "Be the first to save this job!"
            : `Saved by ${savedCount} users`
        }
      />
      <StatIcon
        icon={Send}
        count={appliedCount}
        tooltipText={
          appliedCount === 0
            ? "Be the first to apply to this job!"
            : `Applied by ${appliedCount} users`
        }
      />
    </div>
  );
}

// JobNavigation Component
function JobNavigation({
  currentJobIndex,
  totalJobs,
  onPrevious,
  onNext,
  onJobSelect,
}: {
  currentJobIndex: number;
  totalJobs: number;
  onPrevious: () => void;
  onNext: () => void;
  onJobSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0"
        onClick={onPrevious}
      >
        <ChevronLeft className="w-3 h-3" />
      </Button>

      <div className="flex space-x-1">
        {Array.from({ length: totalJobs }).map((_, jobIndex) => (
          <div
            key={jobIndex}
            className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-400 ease-out ${
              jobIndex === currentJobIndex
                ? "bg-pink-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            onClick={() => onJobSelect(jobIndex)}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0"
        onClick={onNext}
      >
        <ChevronRight className="w-3 h-3" />
      </Button>
    </div>
  );
}

// JobHeader Component
function JobHeader({
  jobTitle,
  companyName,
  location,
  publishDate,
}: {
  jobTitle: string;
  companyName: string;
  location: string;
  publishDate: string;
}) {
  const getCleanJobTitle = (
    jobTitle: string,
    companyName: string,
    location: string
  ): string => {
    const toCapitalCase = (str: string) =>
      str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    const rawTitle = jobTitle || "";
    const company = companyName || "";

    console.log(rawTitle);

    let title = rawTitle;

    if (company && title.toLowerCase().includes(company.toLowerCase())) {
      // Remove company name and any following punctuation/whitespace
      const regex = new RegExp(
        company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[,\\-:|]*\\s*",
        "i"
      );
      title = title.replace(regex, "");
    }

    // Remove anything in parentheses (including the parentheses themselves), globally
    title = title.replace(/\s*\([^)]*\)/g, "").trim();

    // Remove location if present after a dash, comma, or pipe
    // e.g. "Manager - New York, NY", "Manager | Remote", "Manager, San Francisco"
    title = title.replace(/[-|,:]\s*[\w\s\.,\-&\/\(\)]+$/, "").trim();
    title = title.replace(location, "").trim();

    // Remove trailing whitespace and punctuation
    title = title.replace(/[\s\-|,:]+$/, "").trim();

    // Convert to Capital Case
    title = toCapitalCase(title);

    return title;
  };

  // Returns a string like "6h", "2d", "3w", "1mo", "2y" for how long since the date
  function getTimeSince(dateString: string): string {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(diffMs)) return "";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44); // average month
    const years = Math.floor(days / 365.25);

    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}mo`;
    if (weeks > 0) return `${weeks}w`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {getCleanJobTitle(jobTitle, companyName, location)}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {location}
        </p>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {getTimeSince(publishDate)}
        </span>
      </div>
    </div>
  );
}

// CompanyInfo Component
function CompanyInfo({ companyData }: { companyData: V5ProcessedCompanyData }) {
  const [imageError, setImageError] = useState(false);

  const getCompanyAbbreviation = (companyName: string) => {
    return companyName
      .split(" ")
      .map((word) => {
        if (!word) return "";
        let abbrev = word[0];
        abbrev += word
          .slice(1)
          .split("")
          .filter((c) => c >= "A" && c <= "Z")
          .join("");
        return abbrev;
      })
      .join("")
      .slice(0, 4);
  };

  const renderCompanyAbbreviationGrid = (companyName: string) => {
    if (companyName.length !== 4) return companyName;
    const letters = companyName.split("");
    return (
      <span className="inline-grid grid-cols-2 grid-rows-2 gap-x-0.5">
        <span className="font-bold">{letters[0]}</span>
        <span className="font-bold">{letters[1]}</span>
        <span className="font-bold">{letters[2]}</span>
        <span className="font-bold">{letters[3]}</span>
      </span>
    );
  };

  return (
    <div className="flex group items-start space-x-2 mb-3">
      <div
        className={`h-14  aspect-square rounded flex items-center justify-center flex-shrink-0 overflow-hidden${
          companyData.image_url && !imageError
            ? ""
            : " bg-pink-100 dark:bg-pink-800/15"
        }`}
      >
        {companyData.image_url && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={companyData.image_url}
            alt={companyData.name}
            className="w-full h-full object-contain p-0.75 rounded-[6px]"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-pink-600 dark:text-pink-300 font-semibold text-md text-center">
            {renderCompanyAbbreviationGrid(
              getCompanyAbbreviation(companyData.name)
            )}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 ">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={
                companyData.website
                  ? companyData.website.startsWith("http")
                    ? companyData.website
                    : `https://${companyData.website}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit font-medium text-gray-900 dark:text-white text-sm line-clamp-1 hover:underline transition-all duration-200 inline-flex items-center group-hover:underline"
              tabIndex={0}
              style={{ overflow: "visible" }}
            >
              <span
                className="flex items-center transition-all duration-300 ease-out group-hover:translate-x-0 -translate-x-3   opacity-0 group-hover:opacity-100 -mr-3 group-hover:-mr-1"
                aria-hidden="true"
              >
                <ExternalLink className="size-3 text-gray-400 dark:text-gray-300" />
              </span>
              <span className="transition-all duration-300 ea  se-out group-hover:translate-x-2 inline-block">
                {companyData.name}
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent>Visit company site</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="ml-2 group-hover:ml-4 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 dark:text-pink-400 dark:hover:text-pink-300 p-1 h-auto hover:underline font-normal text-xs leading-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle view all jobs logic here
              }}
            >
              View All
            </button>
          </TooltipTrigger>
          <TooltipContent>View all jobs from {companyData.name}</TooltipContent>
        </Tooltip>

        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 cursor-text">
          {companyData.tagline}
        </div>
      </div>
    </div>
  );
}

function JobDescription({
  requirementsSummary,
  technicalTools,
}: {
  requirementsSummary: string;
  technicalTools: string[];
}) {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <JobRequirementsSummary requirementsSummary={requirementsSummary} />
      {technicalTools && technicalTools.length > 0 && (
        <TechnicalTools technicalTools={technicalTools} />
      )}
    </div>
  );
}

export function JobBoardCard({
  jobCollection,
}: {
  jobCollection: JobCollection;
}) {
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const currentJob = jobCollection.jobs[currentJobIndex];

  const handleNextJob = () => {
    setCurrentJobIndex(
      (prevIndex) => (prevIndex + 1) % jobCollection.jobs.length
    );
  };
  const handlePreviousJob = () => {
    setCurrentJobIndex(
      (prevIndex) =>
        (prevIndex - 1 + jobCollection.jobs.length) % jobCollection.jobs.length
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          key={jobCollection.source_and_board_token}
          className="bg-white h-full dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:translate-y-[-5px] transition-all duration-300 ease-out cursor-pointer"
        >
          <CardContent className="p-4 flex flex-col h-full">
            <JobHeader
              jobTitle={currentJob.job_information.title}
              companyName={currentJob.v5_processed_company_data.name}
              location={
                currentJob.v5_processed_job_data.formatted_workplace_location
              }
              publishDate={
                currentJob.v5_processed_job_data.estimated_publish_date
              }
            />

            <CompanyInfo companyData={currentJob.v5_processed_company_data} />

            <JobDescription
              requirementsSummary={
                currentJob.v5_processed_job_data.requirements_summary
              }
              technicalTools={currentJob.v5_processed_job_data.technical_tools}
            />

            <div className="grid grid-cols-3 items-center mt-auto">
              <JobStats
                viewedByUsers={currentJob.job_information.viewedByUsers}
                savedFromUsers={currentJob.job_information.savedFromUsers}
                appliedFromUsers={currentJob.job_information.appliedFromUsers}
              />
              <JobNavigation
                currentJobIndex={currentJobIndex}
                totalJobs={jobCollection.jobs.length}
                onPrevious={handlePreviousJob}
                onNext={handleNextJob}
                onJobSelect={(index) => setCurrentJobIndex(index)}
              />

              {/* <div className="flex justify-end">
                <Button
                  variant="link"
                  size="sm"
                  className="text-pink-500 dark:text-pink-400 text-xs p-0 h-auto"
                >
                  View all
                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bookmark className="mr-2 h-4 w-4" />
          Save Job
        </ContextMenuItem>
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Send className="mr-2 h-4 w-4" />
          Apply Directly
        </ContextMenuItem>
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bookmark className="mr-2 h-4 w-4" />
          Mark Applied
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ExternalLink className="mr-2 h-4 w-4" />
          View All Jobs from {currentJob.v5_processed_company_data.name}
        </ContextMenuItem>
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Link2 className="mr-2 h-4 w-4" />
          Go to Company Website
        </ContextMenuItem>
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Share2 className="mr-2 h-4 w-4" />
          Share Job
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Job
        </ContextMenuItem>
        <ContextMenuItem className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Flag className="mr-2 h-4 w-4" />
          Report Job
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function JobBoardCards() {
  const [jobCollections, setJobCollections] = useState<JobCollection[]>([]);

  useEffect(() => {
    const collections: JobCollection[] = [];

    for (const job of jobsData.results) {
      if (
        !collections.find(
          (collection) =>
            collection.source_and_board_token === job.source_and_board_token
        )
      ) {
        collections.push({
          source_and_board_token: job.source_and_board_token,
          source: job.source,
          board_token: job.board_token,
          jobs: [],
        });
      }
      collections
        .find(
          (collection) =>
            collection.source_and_board_token === job.source_and_board_token
        )
        ?.jobs.push({
          ...job,
          currentJobIndex: 0,
        } as Job);
    }
    setJobCollections(collections);
  }, [setJobCollections]);

  if (jobCollections.length === 0) {
    console.dir(jobCollections);
    console.log(jobCollections.length);
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 gap-4">
        {jobCollections.map((collection) => (
          <JobBoardCard
            key={collection.board_token}
            jobCollection={collection}
          />
        ))}
      </div>
    </div>
  );
}
