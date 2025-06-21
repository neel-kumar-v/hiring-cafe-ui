"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Send,
  Wrench,
  ExternalLink,
  Share2,
  EyeOff,
  Flag,
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
import { Job, JobCollection } from "@/types/jobs";

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

  function renderCompanyAbbreviationGrid(companyName: string) {
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
  }

  const getCleanJobTitle = (
    jobTitle: string,
    companyName: string,
    location: string
  ): string => {
    const rawTitle = jobTitle || "";
    const company = companyName || "";

    let title = rawTitle;
    if (company && title.toLowerCase().includes(company.toLowerCase())) {
      // Remove company name and any following punctuation/whitespace
      const regex = new RegExp(
        company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[,\\-:|]*\\s*",
        "i"
      );
      title = title.replace(regex, "");
    }
    // Remove location if present after a dash, comma, or pipe
    // e.g. "Manager - New York, NY", "Manager | Remote", "Manager, San Francisco"
    title = title.replace(/[-|,:]\s*[\w\s\.,\-&\/\(\)]+$/, "").trim();
    title = title.replace(location, "").trim();

    // Remove trailing whitespace and punctuation
    title = title.replace(/[\s\-|,:]+$/, "").trim();

    return title;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          key={jobCollection.source_and_board_token}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:scale-[1.02] hover:translate-y-[-5px] transition-all duration-300 ease-out"
        >
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {getCleanJobTitle(
                    currentJob.job_information.title,
                    currentJob.v5_processed_company_data.name,
                    currentJob.v5_processed_job_data
                      .formatted_workplace_location
                  )}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {
                    currentJob.v5_processed_job_data
                      .formatted_workplace_location
                  }
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  6h
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2 mb-3">
              <div className="h-14 aspect-square bg-pink-100 dark:bg-pink-100/25 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {currentJob.v5_processed_company_data.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentJob.v5_processed_company_data.image_url}
                    alt={currentJob.v5_processed_company_data.name}
                    className="w-full h-full object-fit p-0.75 rounded-[6px]"
                  />
                ) : (
                  <span className="text-pink-600 dark:text-pink-300 font-semibold text-md text-center">
                    {renderCompanyAbbreviationGrid(
                      getCompanyAbbreviation(
                        currentJob.v5_processed_company_data.name
                      )
                    )}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                  {currentJob.v5_processed_company_data.name}:
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {currentJob.v5_processed_company_data.tagline}
                </div>
              </div>
            </div>

            <div className="mb-3 flex flex-col gap-2">
              <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                {currentJob.v5_processed_job_data.requirements_summary}
              </div>
              {currentJob.v5_processed_job_data.technical_tools &&
                currentJob.v5_processed_job_data.technical_tools.length > 0 && (
                  <div>
                    <Wrench className="size-4 mr-2 inline text-gray-500 dark:text-gray-400" />
                    <div className="inline-flex flex-wrap gap-1 mr-2">
                      {currentJob.v5_processed_job_data.technical_tools
                        .slice(0, 2)
                        .map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="text-xs  text-gray-600 dark:text-gray-400"
                          >
                            {skill.charAt(0).toUpperCase() + skill.slice(1)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-3 items-center mt-auto">
              {/* Viewed, Saved, Applied, Hidden Icons*/}
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
                      <span>
                        {(currentJob.job_information.viewedByUsers?.length ||
                          0) + 1}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {(currentJob.job_information.viewedByUsers?.length ||
                        0) === 0
                        ? "Only viewed by you"
                        : `Viewed by ${
                            (currentJob.job_information.viewedByUsers?.length ||
                              0) + 1
                          } users`}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center space-x-1">
                      <Bookmark className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
                      <span>
                        {currentJob.job_information.savedFromUsers?.length || 0}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {(currentJob.job_information.savedFromUsers?.length ||
                        0) === 0
                        ? "No users have saved this job"
                        : `Saved by ${currentJob.job_information.savedFromUsers?.length} users`}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center space-x-1">
                      <Send className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
                      <span>
                        {currentJob.job_information.appliedFromUsers?.length ||
                          0}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {(currentJob.job_information.appliedFromUsers?.length ||
                        0) === 0
                        ? "No users have applied to this job"
                        : `Applied by ${currentJob.job_information.appliedFromUsers?.length} users`}
                    </p>
                  </TooltipContent>
                </Tooltip>
                {/* {currentJob.job_information.hiddenFromUsers &&
                  currentJob.job_information.hiddenFromUsers.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center space-x-1">
                          <ThumbsDown className="w-3 h-3 inline text-gray-500 dark:text-gray-400" />
                          <span>
                            {currentJob.job_information.hiddenFromUsers.length}
                          </span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Hidden by{" "}
                          {currentJob.job_information.hiddenFromUsers.length} users
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )} */}
              </div>
              {/* Previous, Next, and Job Indicator Buttons */}
              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0"
                  onClick={handlePreviousJob}
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>

                <div className="flex space-x-1">
                  {jobCollection.jobs.map((job, jobIndex) => (
                    <div
                      key={jobIndex}
                      className={`w-1.5 h-1.5 rounded-full ${
                        jobIndex === currentJobIndex
                          ? "bg-pink-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      onClick={() => setCurrentJobIndex(jobIndex)}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 h-6 w-6 p-0"
                  onClick={handleNextJob}
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="link"
                  size="sm"
                  className="text-pink-500 dark:text-pink-400 text-xs p-0 h-auto"
                >
                  View all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem className="text-pink-500 dark:text-pink-400 font-medium">
          <Heart className="mr-2 h-4 w-4" />
          Save Job
        </ContextMenuItem>
        <ContextMenuItem>
          <Send className="mr-2 h-4 w-4" />
          Apply Directly
        </ContextMenuItem>
        <ContextMenuItem>
          <Bookmark className="mr-2 h-4 w-4" />
          Mark Applied
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          Share Job
        </ContextMenuItem>
        <ContextMenuItem>
          <ExternalLink className="mr-2 h-4 w-4" />
          Go to Company Website
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Job
        </ContextMenuItem>
        <ContextMenuItem>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
