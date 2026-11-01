import type { CompanyDTO } from "@/types/convexJobs";
import type { ProcessedCompanyData } from "@/types/job";

export function toUiCompany(company: CompanyDTO | null | undefined): ProcessedCompanyData {
  const canonicalDomain =
    company?.canonicalDomain ||
    (company?.companyId && company.companyId.includes(".") ? company.companyId : undefined) ||
    (company?.homepageUri && company.homepageUri.includes(".") ? company.homepageUri : undefined);

  return {
    name: company?.name ?? "",
    website: company?.homepageUri ?? "",
    canonical_domain: canonicalDomain,
    image_url: company?.imageUrl ?? "",
    tagline: company?.tagline ?? "",
    subsidiaries: [],
    parent_company: "",
    linkedin_url: "",
    industries: company?.industries ?? [],
    activities: company?.activities ?? [],
    is_non_profit: false,
    is_public_company: false,
    is_dissolved: false,
    is_acquired: false,
    num_employees: company?.numEmployees ?? 0,
    year_founded: company?.yearFounded ?? 0,
    headquarters_country: company?.hqCountry ?? "",
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
}
