"use client";

import { BooleanTextbox } from "@/components/search/filters/util/BooleanTextbox";
import { useApp } from "@/contexts/AppContext";
import { decodeSearchExpression } from "@/lib/search";
import type { SearchExpression } from "@/types/search";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import FilterContainer from "../util/FilterContainer";

type FieldKey = "title" | "technical" | "description" | "requirements";

type FieldConfig = {
  key: FieldKey;
  label: string;
  facetType?: string;
  examples?: Record<string, string>;
};

const FIELDS: readonly FieldConfig[] = [
  {
    key: "title",
    label: "Title Keywords",
    facetType: "job_title",
    examples: {
      "Strategy & Operations":
        '("strategy" AND ("operations" OR "transformation") OR ("business strategy" OR "business planning"))',
      "Nurse Practitioner":
        '("nurse practitioner" OR "advanced practice nurse") AND NOT "registered nurse"',
      "Data Scientist":
        '("data scientist" OR ("machine learning" AND (engineer OR scientist))) AND NOT "data analyst"',
      "Construction Project Manager":
        '(construction AND ("project manager" OR "site manager"))',
      "iOS Developer": '(ios AND (developer OR engineer)) AND NOT android',
      "Human Resources Generalist": '("human resources" OR "hr") AND generalist',
      "Elementary School Teacher":
        '("elementary school" AND teacher) AND NOT ("high school" OR "middle school")',
      "Restaurant Manager":
        '("restaurant manager" OR "food service manager") AND NOT "assistant"',
      "Mechanical Engineer": "(mechanical AND engineer) AND NOT civil",
    },
  },
  {
    key: "technical",
    label: "Technical Keywords",
    facetType: "technology_keywords",
    examples: {
      "No Microsoft": "NOT (excel OR outlook OR office)",
      "AWS or Azure": "\"AWS\" OR \"Azure\"",
      "Modern Frontend": "\"React\" AND \"Next.js\" AND \"Tailwind\" AND \"TypeScript\"",
      "JS Full-Stack": "(\"react\" OR \"vue\") AND NOT (\"django\" OR \"flask\")",
    },
  },
  { key: "description", label: "Description Keywords", facetType: undefined },
  { key: "requirements", label: "Requirements Keywords", facetType: undefined },
];

export default function JobTitles() {
  const { searchOptions, updateSearchOptions } = useApp();

  return (
    <FilterContainer
      categoryId="job-titles"
      title="Job Titles & Keywords"
      help="Setup a boolean search for job keywords. e.g. 'software engineer AND NOT (react OR angular)' searches for software engineers that don't have react or angular in their job title."
    >
      <Link
        href="https://en.wikipedia.org/wiki/Full-text_search#Boolean_queries"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-row items-center gap-1 mb-2 mt-[-12px]"
      >
        <span className="font-medium text-sm text-pink-500 dark:text-pink-400 hover:underline">How does boolean search work?</span>
        <ArrowUpRight className="size-4 text-pink-500 dark:text-pink-400 cursor-pointer translate-y-px" />
      </Link>
      <div className="flex flex-col gap-6">
        {FIELDS.map(({ key, label, facetType, examples }) => (
          <div key={key} className="w-full">
            <div className="mb-2 flex flex-col gap-1">
              <span className="text-sm font-medium">{label}</span>
              {facetType ? (
                <span className="text-xs text-muted-foreground">Use the @ symbol to search for available keywords</span>
              ) : null}
            </div>
            <div className="mt-1 w-full">
              <BooleanTextbox
                value={(searchOptions.job_titles[key] as SearchExpression<string>) || ""}
                onChange={(expr: SearchExpression<string>) =>
                  updateSearchOptions({
                    job_titles: {
                      ...searchOptions.job_titles,
                      [key]: expr,
                    },
                  })
                }
                placeholder={`Enter boolean search for ${label.toLowerCase()}`}
                facet_type={facetType}
                examples={examples}
              />
            </div>
          </div>
        ))}
      </div>
    </FilterContainer>
  );
}
