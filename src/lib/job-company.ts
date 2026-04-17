import type { EnrichedCompanyData, Job, ProcessedCompanyData } from "@/types/job";

/** Stable empty company shape for jobs missing both processed and enriched blobs. */
const EMPTY_PROCESSED_COMPANY: ProcessedCompanyData = {
  name: "",
  image_url: "",
  subsidiaries: [],
  parent_company: "",
  website: "",
  linkedin_url: "",
  industries: [],
  activities: [],
  tagline: "",
  is_non_profit: false,
  is_public_company: false,
  is_dissolved: false,
  is_acquired: false,
  num_employees: 0,
  year_founded: 0,
  headquarters_country: "",
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

function mapEnrichedToProcessedCompany(e: EnrichedCompanyData): ProcessedCompanyData {
  const org = (e.organization_type ?? "").toLowerCase();
  let investors: string[] = [];
  const inv = e.latest_funding_investors;
  if (Array.isArray(inv)) {
    investors = inv.filter((x): x is string => typeof x === "string");
  } else if (typeof inv === "string" && inv) {
    investors = [inv];
  }

  return {
    name: e.name ?? "",
    image_url: "",
    subsidiaries: e.subsidiaries ?? [],
    parent_company: e.parent_company ?? "",
    website: e.homepage_uri ?? "",
    linkedin_url: "",
    industries: e.industries ?? [],
    activities: e.activities ?? [],
    tagline: e.tagline ?? "",
    is_non_profit: org.includes("non-profit") || org.includes("nonprofit"),
    is_public_company: org === "public",
    is_dissolved: false,
    is_acquired: false,
    num_employees: typeof e.nb_employees === "number" ? e.nb_employees : 0,
    year_founded: typeof e.year_founded === "number" ? e.year_founded : 0,
    headquarters_country: e.hq_country ?? "",
    total_funding_amount: e.latest_funding_amount ?? null,
    total_funding_currency: null,
    latest_investment_amount: e.latest_funding_amount ?? null,
    latest_investment_currency: null,
    latest_investment_year: e.latest_funding_year ?? null,
    latest_investment_series: e.latest_funding_type ?? null,
    investors,
    stock_exchange: e.stock_exchange ?? null,
    stock_symbol: e.stock_symbol ?? null,
    latest_revenue: null,
    latest_revenue_currency: null,
    latest_revenue_year: null,
  };
}

/**
 * HiringCafe payloads may ship `processed_company_data` or only `enriched_company_data`.
 * UI components expect the processed company shape.
 */
export function toCardCompanyData(job: Job): ProcessedCompanyData {
  if (job.processed_company_data) {
    return job.processed_company_data;
  }
  if (job.enriched_company_data) {
    return mapEnrichedToProcessedCompany(job.enriched_company_data);
  }
  const pj = job.processed_job_data;
  return {
    ...EMPTY_PROCESSED_COMPANY,
    name: pj?.company_name ?? "",
    website: pj?.company_website ?? "",
    activities: pj?.company_activities ?? [],
    tagline: pj?.company_tagline ?? "",
    industries: pj?.company_sector_and_industry ? [pj.company_sector_and_industry] : [],
  };
}

export function getCompanyName(job: Job): string {
  return (
    job.processed_company_data?.name ||
    job.enriched_company_data?.name ||
    job.processed_job_data?.company_name ||
    ""
  );
}
